package iq.gov.mot.rcm;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.hardware.camera2.CameraManager;
import android.net.Uri;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.IsoDep;
import android.nfc.tech.NfcA;
import android.os.Build;
import android.os.Bundle;
import android.os.StatFs;
import android.util.DisplayMetrics;
import android.util.Base64;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.content.FileProvider;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Field verification bridge for the technical verification checklist (TV items).
 * Exposes read-only device capabilities, an NFC eMRTD reader probe, and a
 * staged export channel that packages evidence into a shareable zip.
 * Only the bundled app origin can use it.
 */
final class VerificationBridge {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String EXPORT_ROOT = "verification";
    private static final byte[] EMV_AID = hexToBytes("A0000002471001");
    private static final byte[] SELECT_EF_COM = hexToBytes("00A4020C02011E");

    private final Activity activity;
    private final WebView webView;
    private NfcAdapter nfcAdapter;
    private boolean reading;
    private boolean destroyed;
    private String lastUid = "";
    private long lastUidAt = 0L;

    VerificationBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(webView, "RcmVerify",
                    Collections.singleton(ORIGIN),
                    (view, message, origin, mainFrame, reply) -> {
                        if (!mainFrame || !"https".equals(origin.getScheme())
                                || !"appassets.androidplatform.net".equals(origin.getHost())) return;
                        try {
                            JSONObject data = new JSONObject(message.getData());
                            activity.runOnUiThread(() -> handle(data));
                        } catch (Exception ignored) { /* Ignore malformed bridge requests. */ }
                    });
        }
    }

    private void handle(JSONObject data) {
        if (destroyed) return;
        String id = data.optString("requestId");
        if (id.isEmpty() || id.length() > 120) return;
        String action = data.optString("action");
        switch (action) {
            case "probe":
                new Thread(() -> respondData(id, true, probe())).start();
                break;
            case "nfcStart":
                startNfc(id, data.optBoolean("silent", false));
                break;
            case "nfcStop":
                stopNfc();
                respondData(id, true, json("reading", false));
                break;
            case "nfcSettings":
                openNfcSettings();
                respondData(id, true, null);
                break;
            case "writeExport":
                writeExportAsync(id, data.optString("folder"), data.optString("path"), data.optString("base64"));
                break;
            case "finishExport":
                finishExportAsync(id, data.optString("folder"));
                break;
            case "clearExport":
                deleteRecursively(exportDir(data.optString("folder")));
                respondData(id, true, null);
                break;
            case "appInfo":
                respondData(id, true, appInfo());
                break;
            default:
                respondData(id, false, null);
        }
    }

    // ---------------------------------------------------------------- device probe

    private JSONObject probe() {
        JSONObject result = new JSONObject();
        try { result.put("generatedAt", System.currentTimeMillis()); } catch (Exception ignored) { }
        try { result.put("app", appInfo()); } catch (Exception ignored) { }
        try { result.put("device", deviceInfo()); } catch (Exception ignored) { }
        try { result.put("memory", memoryInfo()); } catch (Exception ignored) { }
        try { result.put("storage", storageInfo()); } catch (Exception ignored) { }
        try { result.put("display", displayInfo()); } catch (Exception ignored) { }
        try { result.put("nfc", nfcInfo()); } catch (Exception ignored) { }
        try { result.put("camera", cameraInfo()); } catch (Exception ignored) { }
        try { result.put("security", securityInfo()); } catch (Exception ignored) { }
        try { result.put("webview", webViewInfo()); } catch (Exception ignored) { }
        return result;
    }

    private JSONObject appInfo() {
        JSONObject app = new JSONObject();
        try {
            PackageManager pm = activity.getPackageManager();
            PackageInfo info = pm.getPackageInfo(activity.getPackageName(), 0);
            app.put("packageName", activity.getPackageName());
            app.put("versionName", info.versionName == null ? "" : info.versionName);
            app.put("versionCode", Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode);
            app.put("role", BuildConfig.APP_ROLE);
            app.put("pocketBaseHost", BuildConfig.POCKETBASE_HOST);
            app.put("firstInstallTime", info.firstInstallTime);
            app.put("lastUpdateTime", info.lastUpdateTime);
            app.put("installer", installerPackage());
            app.put("debuggable", (activity.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        } catch (Exception error) {
            putQuietly(app, "error", error.getClass().getSimpleName());
        }
        return app;
    }

    private JSONObject deviceInfo() {
        JSONObject device = new JSONObject();
        putQuietly(device, "manufacturer", Build.MANUFACTURER);
        putQuietly(device, "brand", Build.BRAND);
        putQuietly(device, "model", Build.MODEL);
        putQuietly(device, "device", Build.DEVICE);
        putQuietly(device, "product", Build.PRODUCT);
        putQuietly(device, "hardware", Build.HARDWARE);
        putQuietly(device, "board", Build.BOARD);
        putQuietly(device, "buildId", Build.ID);
        putQuietly(device, "fingerprint", Build.FINGERPRINT);
        putQuietly(device, "androidRelease", Build.VERSION.RELEASE);
        putQuietly(device, "sdkInt", Build.VERSION.SDK_INT);
        putQuietly(device, "securityPatch", Build.VERSION.SDK_INT >= 23 ? Build.VERSION.SECURITY_PATCH : "");
        putQuietly(device, "abis", Arrays.toString(Build.SUPPORTED_ABIS));
        putQuietly(device, "is64Bit", Build.VERSION.SDK_INT >= 23 && Build.SUPPORTED_64_BIT_ABIS.length > 0);
        putQuietly(device, "cpuCores", Runtime.getRuntime().availableProcessors());
        putQuietly(device, "timeZone", TimeZone.getDefault().getID());
        putQuietly(device, "locale", Locale.getDefault().toString());
        putQuietly(device, "localTime", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(new Date()));
        putQuietly(device, "emulatorSuspected", isEmulatorSuspected());
        putQuietly(device, "biometricFingerprint", activity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_FINGERPRINT));
        putQuietly(device, "biometricFace", activity.getPackageManager().hasSystemFeature("android.hardware.biometrics.face"));
        putQuietly(device, "biometricIris", activity.getPackageManager().hasSystemFeature("android.hardware.biometrics.iris"));
        return device;
    }

    private JSONObject memoryInfo() {
        JSONObject memory = new JSONObject();
        ActivityManager manager = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
        ActivityManager.MemoryInfo info = new ActivityManager.MemoryInfo();
        manager.getMemoryInfo(info);
        putQuietly(memory, "totalBytes", info.totalMem);
        putQuietly(memory, "availBytes", info.availMem);
        putQuietly(memory, "thresholdBytes", info.threshold);
        putQuietly(memory, "lowMemory", info.lowMemory);
        putQuietly(memory, "lowRamDevice", manager.isLowRamDevice());
        putQuietly(memory, "memoryClassMb", manager.getMemoryClass());
        putQuietly(memory, "largeMemoryClassMb", manager.getLargeMemoryClass());
        return memory;
    }

    private JSONObject storageInfo() {
        JSONObject storage = new JSONObject();
        File files = activity.getFilesDir();
        StatFs internal = new StatFs(files.getAbsolutePath());
        putQuietly(storage, "internalTotalBytes", (long) internal.getBlockCountLong() * internal.getBlockSizeLong());
        putQuietly(storage, "internalFreeBytes", (long) internal.getAvailableBlocksLong() * internal.getBlockSizeLong());
        File external = activity.getExternalFilesDir(null);
        if (external != null) {
            StatFs ext = new StatFs(external.getAbsolutePath());
            putQuietly(storage, "externalTotalBytes", (long) ext.getBlockCountLong() * ext.getBlockSizeLong());
            putQuietly(storage, "externalFreeBytes", (long) ext.getAvailableBlocksLong() * ext.getBlockSizeLong());
        }
        return storage;
    }

    private JSONObject displayInfo() {
        JSONObject display = new JSONObject();
        WindowManager manager = activity.getWindowManager();
        DisplayMetrics metrics = new DisplayMetrics();
        manager.getDefaultDisplay().getRealMetrics(metrics);
        putQuietly(display, "widthPx", metrics.widthPixels);
        putQuietly(display, "heightPx", metrics.heightPixels);
        putQuietly(display, "densityDpi", metrics.densityDpi);
        putQuietly(display, "density", metrics.density);
        putQuietly(display, "refreshRate", manager.getDefaultDisplay().getRefreshRate());
        putQuietly(display, "fontScale", activity.getResources().getConfiguration().fontScale);
        return display;
    }

    private JSONObject nfcInfo() {
        JSONObject nfc = new JSONObject();
        NfcAdapter adapter = NfcAdapter.getDefaultAdapter(activity);
        putQuietly(nfc, "supported", adapter != null);
        putQuietly(nfc, "enabled", adapter != null && adapter.isEnabled());
        return nfc;
    }

    private JSONObject cameraInfo() {
        JSONObject camera = new JSONObject();
        try {
            CameraManager manager = (CameraManager) activity.getSystemService(Context.CAMERA_SERVICE);
            String[] ids = manager.getCameraIdList();
            JSONArray list = new JSONArray();
            for (String cameraId : ids) {
                JSONObject item = new JSONObject();
                putQuietly(item, "id", cameraId);
                try {
                    android.hardware.camera2.CameraCharacteristics chars = manager.getCameraCharacteristics(cameraId);
                    Integer facing = chars.get(android.hardware.camera2.CameraCharacteristics.LENS_FACING);
                    putQuietly(item, "facing", facing == null ? -1 : facing);
                    Boolean flash = chars.get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE);
                    putQuietly(item, "flash", flash != null && flash);
                    android.util.Size size = chars.get(android.hardware.camera2.CameraCharacteristics.SENSOR_INFO_PIXEL_ARRAY_SIZE);
                    if (size != null) {
                        putQuietly(item, "sensorWidth", size.getWidth());
                        putQuietly(item, "sensorHeight", size.getHeight());
                    }
                } catch (Exception ignored) { }
                list.put(item);
            }
            camera.put("count", ids.length);
            camera.put("list", list);
        } catch (Exception error) {
            putQuietly(camera, "count", -1);
            putQuietly(camera, "error", error.getClass().getSimpleName());
        }
        putQuietly(camera, "featureBack", activity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA));
        putQuietly(camera, "featureFront", activity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA_FRONT));
        putQuietly(camera, "featureFlash", activity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA_FLASH));
        return camera;
    }

    private JSONObject securityInfo() {
        JSONObject security = new JSONObject();
        putQuietly(security, "playStoreInstalled", isPackageInstalled("com.android.vending"));
        putQuietly(security, "playServicesInstalled", isPackageInstalled("com.google.android.gms"));
        putQuietly(security, "playServicesVersion", packageVersion("com.google.android.gms"));
        putQuietly(security, "gsfInstalled", isPackageInstalled("com.google.android.gsf"));
        putQuietly(security, "signatureSha256", signatureSha256());
        putQuietly(security, "rootSuspected", isRootSuspected());
        return security;
    }

    private JSONObject webViewInfo() {
        JSONObject info = new JSONObject();
        try {
            PackageInfo pkg = WebViewCompat.getCurrentWebViewPackage(activity);
            putQuietly(info, "package", pkg == null ? "" : pkg.packageName);
            putQuietly(info, "version", pkg == null ? "" : pkg.versionName);
        } catch (Exception ignored) { }
        putQuietly(info, "userAgent", new WebView(activity).getSettings().getUserAgentString());
        return info;
    }

    private boolean isPackageInstalled(String name) {
        try {
            activity.getPackageManager().getPackageInfo(name, 0);
            return true;
        } catch (Exception error) {
            return false;
        }
    }

    private String packageVersion(String name) {
        try {
            PackageInfo info = activity.getPackageManager().getPackageInfo(name, 0);
            return info.versionName == null ? "" : info.versionName;
        } catch (Exception error) {
            return "";
        }
    }

    private String installerPackage() {
        try {
            PackageManager pm = activity.getPackageManager();
            if (Build.VERSION.SDK_INT >= 30) {
                return String.valueOf(pm.getInstallSourceInfo(activity.getPackageName()).getInstallingPackageName());
            }
            return String.valueOf(pm.getInstallerPackageName(activity.getPackageName()));
        } catch (Exception error) {
            return "";
        }
    }

    private String signatureSha256() {
        try {
            PackageManager pm = activity.getPackageManager();
            Signature[] signatures;
            if (Build.VERSION.SDK_INT >= 28) {
                signatures = pm.getPackageInfo(activity.getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES)
                        .signingInfo.getApkContentsSigners();
            } else {
                signatures = pm.getPackageInfo(activity.getPackageName(), PackageManager.GET_SIGNATURES).signatures;
            }
            if (signatures == null || signatures.length == 0) return "";
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return bytesToHex(digest.digest(signatures[0].toByteArray()));
        } catch (Exception error) {
            return "";
        }
    }

    private boolean isEmulatorSuspected() {
        String fingerprint = String.valueOf(Build.FINGERPRINT).toLowerCase(Locale.ROOT);
        String model = String.valueOf(Build.MODEL).toLowerCase(Locale.ROOT);
        String hardware = String.valueOf(Build.HARDWARE).toLowerCase(Locale.ROOT);
        return fingerprint.startsWith("generic") || fingerprint.contains("vbox") || fingerprint.contains("emulator")
                || model.contains("sdk") || model.contains("emulator") || model.contains("android sdk")
                || hardware.contains("goldfish") || hardware.contains("ranchu");
    }

    private boolean isRootSuspected() {
        String[] paths = {"/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su",
                "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su", "/system/bin/failsafe/su",
                "/data/local/su", "/su/bin/su", "/magisk/.core/bin/su"};
        for (String path : paths) {
            try {
                if (new File(path).exists()) return true;
            } catch (Exception ignored) { }
        }
        return false;
    }

    // ---------------------------------------------------------------- NFC reader probe

    private void startNfc(String id, boolean silent) {
        nfcAdapter = NfcAdapter.getDefaultAdapter(activity);
        if (nfcAdapter == null) {
            respondError(id, "nfc-unsupported");
            return;
        }
        if (!nfcAdapter.isEnabled()) {
            respondError(id, "nfc-disabled");
            return;
        }
        try {
            Bundle options = new Bundle();
            options.putInt(NfcAdapter.EXTRA_READER_PRESENCE_CHECK_DELAY, 300);
            int flags = NfcAdapter.FLAG_READER_NFC_A | NfcAdapter.FLAG_READER_NFC_B
                    | NfcAdapter.FLAG_READER_NFC_F | NfcAdapter.FLAG_READER_NFC_V
                    | NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK
                    | NfcAdapter.FLAG_READER_NO_PLATFORM_SOUNDS;
            reading = true;
            lastUid = "";
            lastUidAt = 0L;
            nfcAdapter.enableReaderMode(activity, this::onTagDiscovered, flags, options);
            emitNfc(json("type", silent ? "resumed" : "started"));
            respondData(id, true, json("reading", true));
        } catch (Exception error) {
            respondError(id, "nfc-start-failed");
        }
    }

    private void stopNfc() {
        if (nfcAdapter != null && reading) {
            try { nfcAdapter.disableReaderMode(activity); } catch (Exception ignored) { }
        }
        if (reading) {
            reading = false;
            emitNfc(json("type", "stopped"));
        }
    }

    private void openNfcSettings() {
        try {
            activity.startActivity(new Intent(android.provider.Settings.ACTION_NFC_SETTINGS)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        } catch (Exception ignored) { }
    }

    private void onTagDiscovered(Tag tag) {
        if (!reading || tag == null) return;
        String uid = bytesToHex(tag.getId());
        long now = System.currentTimeMillis();
        if (uid.equals(lastUid) && now - lastUidAt < 1200) return;
        lastUid = uid;
        lastUidAt = now;

        JSONObject event = new JSONObject();
        putQuietly(event, "type", "tag");
        putQuietly(event, "uid", uid);
        putQuietly(event, "at", now);

        JSONArray techs = new JSONArray();
        String[] techList = tag.getTechList();
        for (String tech : techList) techs.put(tech.replace("android.nfc.tech.", ""));
        putQuietly(event, "techs", techs);

        NfcA nfcA = NfcA.get(tag);
        if (nfcA != null) {
            putQuietly(event, "atqa", bytesToHex(nfcA.getAtqa()));
            putQuietly(event, "sak", String.format(Locale.US, "%02X", nfcA.getSak()));
        }

        IsoDep isoDep = IsoDep.get(tag);
        putQuietly(event, "isoDep", isoDep != null);
        if (isoDep == null) {
            putQuietly(event, "error", "no-iso-dep");
            emitNfc(event);
            return;
        }

        long started = System.currentTimeMillis();
        try {
            isoDep.connect();
            isoDep.setTimeout(4000);
            putQuietly(event, "historicalBytes", bytesToHex(isoDep.getHistoricalBytes()));
            putQuietly(event, "hiLayerResponse", bytesToHex(isoDep.getHiLayerResponse()));

            // PACE/BAC protected cards still answer SELECT by AID on the ISO-DEP layer.
            byte[] aidSelect = concat(new byte[]{0x00, (byte) 0xA4, 0x04, 0x0C, 0x07}, EMV_AID);
            Response aidResponse = transceive(isoDep, aidSelect);
            putQuietly(event, "aidSelect", aidResponse.toJson());

            if (aidResponse.ok()) {
                Response efCom = transceive(isoDep, SELECT_EF_COM);
                putQuietly(event, "efCom", efCom.toJson());
            }
            putQuietly(event, "isoDepMs", System.currentTimeMillis() - started);
            putQuietly(event, "ok", aidResponse.ok());
        } catch (Exception error) {
            putQuietly(event, "error", error.getClass().getSimpleName());
            putQuietly(event, "isoDepMs", System.currentTimeMillis() - started);
        } finally {
            try { isoDep.close(); } catch (Exception ignored) { }
        }
        emitNfc(event);
    }

    private static final class Response {
        int status;
        String hex;
        long ms;

        boolean ok() {
            return status == 0x9000;
        }

        JSONObject toJson() {
            JSONObject object = new JSONObject();
            putQuietly(object, "sw", String.format(Locale.US, "%04X", status));
            putQuietly(object, "ok", ok());
            putQuietly(object, "ms", ms);
            putQuietly(object, "hex", hex.length() > 240 ? hex.substring(0, 240) + "..." : hex);
            putQuietly(object, "length", hex.length() / 2);
            return object;
        }
    }

    private Response transceive(IsoDep isoDep, byte[] command) throws IOException {
        long started = System.currentTimeMillis();
        byte[] response = isoDep.transceive(command);
        Response result = new Response();
        result.ms = System.currentTimeMillis() - started;
        result.hex = bytesToHex(response);
        if (response.length >= 2) {
            result.status = ((response[response.length - 2] & 0xFF) << 8) | (response[response.length - 1] & 0xFF);
        }
        return result;
    }

    // ---------------------------------------------------------------- staged export

    private File exportDir(String folder) {
        File base = activity.getExternalFilesDir(null);
        if (base == null) base = activity.getFilesDir();
        String safe = folder == null ? "" : folder.replaceAll("[^A-Za-z0-9_-]", "");
        if (safe.isEmpty()) safe = "session";
        return new File(new File(base, EXPORT_ROOT), safe);
    }

    private void writeExportAsync(String id, String folder, String path, String base64) {
        new Thread(() -> {
            try {
                String safePath = path == null ? "" : path.replace('\\', '/').replaceAll("\\.\\.", "_");
                if (safePath.isEmpty() || base64 == null) {
                    respondError(id, "bad-request");
                    return;
                }
                File dir = exportDir(folder);
                File target = new File(dir, safePath);
                if (!target.getCanonicalPath().startsWith(dir.getCanonicalPath())) {
                    respondError(id, "bad-path");
                    return;
                }
                File parent = target.getParentFile();
                if (parent != null && !parent.exists() && !parent.mkdirs()) {
                    respondError(id, "mkdir-failed");
                    return;
                }
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                try (FileOutputStream out = new FileOutputStream(target)) {
                    out.write(bytes);
                }
                respondData(id, true, json("path", target.getAbsolutePath(), "bytes", bytes.length));
            } catch (Exception error) {
                respondError(id, "write-failed");
            }
        }).start();
    }

    private void finishExportAsync(String id, String folder) {
        new Thread(() -> {
            File dir = exportDir(folder);
            if (!dir.isDirectory()) {
                respondError(id, "nothing-to-export");
                return;
            }
            String stamp = new SimpleDateFormat("yyyyMMdd-HHmm", Locale.US).format(new Date());
            File zip = new File(activity.getCacheDir(), "rcm-verification-" + stamp + ".zip");
            try (ZipOutputStream out = new ZipOutputStream(new java.io.BufferedOutputStream(new FileOutputStream(zip)))) {
                zipInto(out, dir, "");
            } catch (Exception error) {
                respondError(id, "zip-failed");
                return;
            }
            try {
                Uri uri = FileProvider.getUriForFile(activity,
                        activity.getPackageName() + ".fileprovider", zip);
                Intent send = new Intent(Intent.ACTION_SEND)
                        .setType("application/zip")
                        .putExtra(Intent.EXTRA_STREAM, uri)
                        .putExtra(Intent.EXTRA_SUBJECT, "RCM field verification " + stamp)
                        .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Intent chooser = Intent.createChooser(send, "RCM verification export")
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(chooser);
                respondData(id, true, json("zip", zip.getName(), "bytes", zip.length(), "shared", true));
            } catch (Exception error) {
                // No share target: keep the zip on disk and report its path.
                respondData(id, true, json("zip", zip.getAbsolutePath(),
                        "bytes", zip.length(), "shared", false));
            }
        }).start();
    }

    private void zipInto(ZipOutputStream out, File dir, String prefix) throws IOException {
        File[] children = dir.listFiles();
        if (children == null) return;
        Arrays.sort(children);
        for (File child : children) {
            String entryName = prefix + child.getName();
            if (child.isDirectory()) {
                zipInto(out, child, entryName + "/");
            } else {
                out.putNextEntry(new ZipEntry(entryName));
                try (java.io.FileInputStream in = new java.io.FileInputStream(child)) {
                    byte[] buffer = new byte[16384];
                    int read;
                    while ((read = in.read(buffer)) > 0) out.write(buffer, 0, read);
                }
                out.closeEntry();
            }
        }
    }

    private void deleteRecursively(File file) {
        if (file == null || !file.exists()) return;
        File[] children = file.listFiles();
        if (children != null) for (File child : children) deleteRecursively(child);
        //noinspection ResultOfMethodCallIgnored
        file.delete();
    }

    // ---------------------------------------------------------------- plumbing

    void onPause() {
        if (reading) stopNfc();
    }

    void destroy() {
        stopNfc();
        destroyed = true;
    }

    private void emitNfc(JSONObject data) {
        emit("rcm-verify-nfc", data);
    }

    private void respondError(String id, String code) {
        JSONObject payload = json("requestId", id, "success", false, "error", code);
        emit("rcm-verify-response", payload);
    }

    private void respondData(String id, boolean success, JSONObject data) {
        JSONObject payload = json("requestId", id, "success", success);
        try {
            if (data != null) payload.put("data", data);
        } catch (Exception ignored) { }
        emit("rcm-verify-response", payload);
    }

    private void emit(String event, JSONObject data) {
        if (destroyed || activity.isFinishing()) return;
        activity.runOnUiThread(() -> webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent(" + JSONObject.quote(event) + ",{detail:" + data + "}));", null));
    }

    private static JSONObject json(Object... entries) {
        JSONObject result = new JSONObject();
        try {
            for (int i = 0; i < entries.length; i += 2) result.put((String) entries[i], entries[i + 1]);
        } catch (Exception ignored) { }
        return result;
    }

    private static void putQuietly(JSONObject target, String key, Object value) {
        try { target.put(key, value); } catch (Exception ignored) { }
    }

    private static byte[] concat(byte[] first, byte[] second) {
        byte[] result = new byte[first.length + second.length];
        System.arraycopy(first, 0, result, 0, first.length);
        System.arraycopy(second, 0, result, first.length, second.length);
        return result;
    }

    private static byte[] hexToBytes(String hex) {
        int length = hex.length();
        byte[] output = new byte[length / 2];
        for (int i = 0; i < length; i += 2) {
            output[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    | Character.digit(hex.charAt(i + 1), 16));
        }
        return output;
    }

    private static String bytesToHex(byte[] bytes) {
        if (bytes == null || bytes.length == 0) return "";
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) builder.append(String.format(Locale.US, "%02X", value));
        return builder.toString();
    }
}
