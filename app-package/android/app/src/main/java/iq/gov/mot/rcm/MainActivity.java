package iq.gov.mot.rcm;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.ClipData;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.MimeTypeMap;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.PermissionRequest;
import android.graphics.Color;
import android.view.Window;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.webkit.WebViewAssetLoader;
import androidx.core.content.FileProvider;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.WindowInsetsControllerCompat;

import java.io.File;
import java.io.ByteArrayInputStream;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final int CAMERA_PERMISSION_REQUEST = 1002;
    private WebView webView;
    private AppSupportBridge appSupportBridge;
    private ValueCallback<Uri[]> fileChooserCallback;
    private PermissionRequest pendingWebPermission;
    private Uri pendingCameraUri;
    private Intent pendingCameraChooser;
    private Intent pendingFilePicker;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);
        WindowInsetsControllerCompat insetsController = new WindowInsetsControllerCompat(window, window.getDecorView());
        insetsController.setAppearanceLightStatusBars(true);
        insetsController.setAppearanceLightNavigationBars(true);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.WHITE);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        ViewCompat.setOnApplyWindowInsetsListener(root, (view, windowInsets) -> {
            Insets safeInsets = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) webView.getLayoutParams();
            params.setMargins(safeInsets.left, safeInsets.top, safeInsets.right, safeInsets.bottom);
            webView.setLayoutParams(params);
            return WindowInsetsCompat.CONSUMED;
        });
        setContentView(root);
        ViewCompat.requestApplyInsets(root);

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/", path -> {
                    // Vite writes index.html at the asset root and chunks under assets/.
                    String assetPath = "assets/index.html".equals(path) ? "index.html" : path;
                    if (assetPath.contains("..")) return offlineResponse(403, "Forbidden");
                    try {
                        String extension = MimeTypeMap.getFileExtensionFromUrl(assetPath);
                        String mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
                        if (mimeType == null) mimeType = "application/octet-stream";
                        String encoding = mimeType.startsWith("text/") || mimeType.contains("javascript")
                                || mimeType.contains("json") || mimeType.contains("xml") ? "UTF-8" : null;
                        return new WebResourceResponse(mimeType, encoding, getAssets().open(assetPath));
                    } catch (java.io.IOException error) {
                        return offlineResponse(404, "Not Found");
                    }
                })
                .build();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        appSupportBridge = new AppSupportBridge(this, webView);
        // The build flavor decides which login/registration flow the bundled app uses.
        webView.addJavascriptInterface(new AppRoleBridge(BuildConfig.APP_ROLE), "RcmAppRole");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("appassets.androidplatform.net".equals(uri.getHost())) return assetLoader.shouldInterceptRequest(uri);
                if (RemoteResourcePolicy.allows(uri.getScheme(), uri.getHost(), uri.getPort(),
                        request.getMethod(), uri.getPath(), BuildConfig.POCKETBASE_HOST)) return null;
                return offlineResponse(403, "Offline");
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Keep the local application in the WebView. External links are handed to Android.
                Uri uri = request.getUrl();
                if (AppSupportBridge.isAppUrl(uri)) return false;
                if (request.isForMainFrame() && "https".equalsIgnoreCase(uri.getScheme())) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri)
                                .addCategory(Intent.CATEGORY_BROWSABLE));
                    } catch (android.content.ActivityNotFoundException ignored) {
                        // Keep the app open if no browser or navigation app can handle the link.
                    }
                }
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
                pendingCameraChooser = null;
                pendingFilePicker = null;
                fileChooserCallback = callback;
                try {
                    Intent pickerIntent = params.createIntent();
                    if (params.isCaptureEnabled() && isImageSelection(params)) {
                        File captureFile = File.createTempFile("rcm-capture-", ".jpg", getCacheDir());
                        pendingCameraUri = FileProvider.getUriForFile(MainActivity.this,
                                getPackageName() + ".fileprovider", captureFile);
                        Intent cameraIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                        cameraIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, pendingCameraUri);
                        cameraIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                        cameraIntent.setClipData(ClipData.newRawUri("camera-output", pendingCameraUri));
                        Intent chooser = Intent.createChooser(pickerIntent, "选择文件或拍照");
                        chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});
                        chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                        chooser.setClipData(ClipData.newRawUri("camera-output", pendingCameraUri));
                        pendingCameraChooser = chooser;
                        pendingFilePicker = pickerIntent;
                        if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                            launchPendingFileChooser(true);
                        } else {
                            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
                        }
                    } else {
                        pendingCameraUri = null;
                        startActivityForResult(pickerIntent, FILE_CHOOSER_REQUEST);
                    }
                    return true;
                } catch (Exception e) {
                    fileChooserCallback = null;
                    pendingCameraUri = null;
                    return false;
                }
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    boolean requestsCamera = false;
                    for (String resource : request.getResources()) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) requestsCamera = true;
                    }
                    if (!requestsCamera) {
                        request.deny();
                        return;
                    }
                    if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                        request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                    } else {
                        pendingWebPermission = request;
                        requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
                    }
                });
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingWebPermission == request) pendingWebPermission = null;
            }
        });

        String startRoute = "citizen".equals(BuildConfig.APP_ROLE)
                ? "login?role=citizen&layout=app"
                : "login?role=agent&layout=app";
        Uri notificationTarget = getIntent().getData();
        webView.loadUrl(AppSupportBridge.isAppUrl(notificationTarget) ? notificationTarget.toString()
                : "https://appassets.androidplatform.net/assets/index.html#/" + startRoute);
    }

    private boolean isImageSelection(WebChromeClient.FileChooserParams params) {
        String[] types = params.getAcceptTypes();
        if (types == null || types.length == 0) return false;
        for (String type : types) {
            if (type != null && (type.startsWith("image/") || type.startsWith(".jpg") || type.startsWith(".jpeg") || type.startsWith(".png"))) {
                return true;
            }
        }
        return false;
    }

    private WebResourceResponse offlineResponse(int status, String reason) {
        return new WebResourceResponse("text/plain", "UTF-8", status, reason, null,
                new ByteArrayInputStream(new byte[0]));
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (appSupportBridge != null && appSupportBridge.onPermissionsResult(requestCode, grantResults)) return;
        if (requestCode == CAMERA_PERMISSION_REQUEST && pendingCameraChooser != null && fileChooserCallback != null) {
            boolean cameraGranted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            launchPendingFileChooser(cameraGranted);
        } else if (requestCode == CAMERA_PERMISSION_REQUEST && pendingWebPermission != null) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                pendingWebPermission.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
            } else {
                pendingWebPermission.deny();
            }
            pendingWebPermission = null;
        }
    }

    private void launchPendingFileChooser(boolean includeCamera) {
        Intent chooserIntent = includeCamera ? pendingCameraChooser : pendingFilePicker;
        Intent pickerFallback = pendingFilePicker;
        pendingCameraChooser = null;
        pendingFilePicker = null;
        if (!includeCamera) pendingCameraUri = null;
        if (chooserIntent == null) {
            completeFileChooser(null);
            return;
        }
        try {
            startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST);
        } catch (Exception error) {
            if (includeCamera && pickerFallback != null) {
                try {
                    pendingCameraUri = null;
                    startActivityForResult(pickerFallback, FILE_CHOOSER_REQUEST);
                    return;
                } catch (Exception ignored) {
                    // Complete the WebView callback below when neither handler can be opened.
                }
            }
            completeFileChooser(null);
        }
    }

    private void completeFileChooser(Uri[] result) {
        if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(result);
        fileChooserCallback = null;
        pendingCameraUri = null;
        pendingCameraChooser = null;
        pendingFilePicker = null;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && fileChooserCallback != null) {
            Uri[] results = resultCode == RESULT_OK && pendingCameraUri != null && (data == null || data.getData() == null)
                    ? new Uri[]{pendingCameraUri}
                    : WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            completeFileChooser(results);
        }
    }

    @Override
    protected void onPause() {
        if (appSupportBridge != null) appSupportBridge.pauseSpeech();
        super.onPause();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (webView != null && AppSupportBridge.isAppUrl(intent.getData())) webView.loadUrl(intent.getData().toString());
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        completeFileChooser(null);
        if (appSupportBridge != null) appSupportBridge.destroy();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
