package iq.gov.mot.rcm;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.webkit.WebView;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Collections;

/** Native services are exposed only to the bundled app's top-level origin. */
final class AppSupportBridge {
    private static final int AUDIO_PERMISSION = 1101;
    private static final int NOTIFICATION_PERMISSION = 1102;
    private static final String CHANNEL = "rcm_business_updates";
    private final Activity activity;
    private final WebView webView;
    private SpeechRecognizer recognizer;
    private String speechId = "";
    private String pendingSpeechId = "";
    private String pendingLanguage = "";
    private String notificationPermissionId = "";
    private boolean destroyed;

    AppSupportBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(webView, "RcmNative",
                    Collections.singleton("https://appassets.androidplatform.net"),
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

    static boolean isAppUrl(Uri uri) {
        return uri != null && "https".equals(uri.getScheme())
                && "appassets.androidplatform.net".equals(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443)
                && "/assets/index.html".equals(uri.getPath());
    }

    private void handle(JSONObject data) {
        if (destroyed) return;
        String id = data.optString("requestId");
        if (id.isEmpty() || id.length() > 100) return;
        switch (data.optString("action")) {
            case "startSpeech":
                cancelSpeech();
                pendingSpeechId = id;
                String language = data.optString("language", "ar-IQ");
                pendingLanguage = language.matches("(zh-CN|en-US|ar-IQ|ckb-IQ)") ? language : "ar-IQ";
                if (activity.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    activity.requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, AUDIO_PERMISSION);
                } else startSpeech();
                break;
            case "stopSpeech":
                if (id.equals(speechId) && recognizer != null) recognizer.stopListening();
                else if (id.equals(pendingSpeechId)) { pendingSpeechId = ""; speechEvent(id, "end", "", false, ""); }
                break;
            case "cancelSpeech":
                if (id.equals(speechId) || id.equals(pendingSpeechId)) cancelSpeech();
                break;
            case "enableNotifications":
                if (Build.VERSION.SDK_INT >= 33 && activity.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    if (!notificationPermissionId.isEmpty()) respond(notificationPermissionId, false);
                    notificationPermissionId = id;
                    activity.requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION);
                } else respond(id, NotificationManagerCompat.from(activity).areNotificationsEnabled());
                break;
            case "notify":
                respond(id, showNotification(data));
                break;
            default: respond(id, false);
        }
    }

    boolean onPermissionsResult(int code, int[] results) {
        boolean granted = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
        if (code == AUDIO_PERMISSION) {
            if (!pendingSpeechId.isEmpty()) {
                if (granted) startSpeech();
                else {
                    String id = pendingSpeechId;
                    pendingSpeechId = "";
                    speechEvent(id, "error", "", false, "not-allowed");
                    speechEvent(id, "end", "", false, "");
                }
            }
            return true;
        }
        if (code == NOTIFICATION_PERMISSION) {
            respond(notificationPermissionId, granted && NotificationManagerCompat.from(activity).areNotificationsEnabled());
            notificationPermissionId = "";
            return true;
        }
        return false;
    }

    private void startSpeech() {
        speechId = pendingSpeechId;
        pendingSpeechId = "";
        final String id = speechId;
        if (!SpeechRecognizer.isRecognitionAvailable(activity)) { finishSpeech(id, "unsupported"); return; }
        try {
            recognizer = SpeechRecognizer.createSpeechRecognizer(activity);
            recognizer.setRecognitionListener(new RecognitionListener() {
                public void onReadyForSpeech(Bundle params) { }
                public void onBeginningOfSpeech() { }
                public void onRmsChanged(float rmsdB) { }
                public void onBufferReceived(byte[] buffer) { }
                public void onEndOfSpeech() { }
                public void onEvent(int eventType, Bundle params) { }
                public void onPartialResults(Bundle results) { sendTranscript(id, results, false); }
                public void onResults(Bundle results) { sendTranscript(id, results, true); finishSpeech(id, ""); }
                public void onError(int error) {
                    String code;
                    switch (error) {
                        case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: code = "not-allowed"; break;
                        case SpeechRecognizer.ERROR_NO_MATCH:
                        case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: code = "no-speech"; break;
                        case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: code = "busy"; break;
                        case SpeechRecognizer.ERROR_AUDIO: code = "audio-capture"; break;
                        case SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED:
                        case SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE: code = "language-not-supported"; break;
                        default: code = "recognition-failed";
                    }
                    finishSpeech(id, code);
                }
            });
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, pendingLanguage);
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            recognizer.startListening(intent);
        } catch (Exception error) { finishSpeech(id, "recognition-failed"); }
    }

    private void sendTranscript(String id, Bundle results, boolean complete) {
        if (!id.equals(speechId)) return;
        ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (matches != null && !matches.isEmpty()) speechEvent(id, "result", matches.get(0), complete, "");
    }

    private void finishSpeech(String id, String error) {
        if (!id.equals(speechId)) return;
        speechId = "";
        if (recognizer != null) { recognizer.destroy(); recognizer = null; }
        if (!error.isEmpty()) speechEvent(id, "error", "", false, error);
        speechEvent(id, "end", "", false, "");
    }

    private void cancelSpeech() {
        String id = speechId.isEmpty() ? pendingSpeechId : speechId;
        speechId = pendingSpeechId = "";
        if (recognizer != null) { recognizer.cancel(); recognizer.destroy(); recognizer = null; }
        if (!id.isEmpty()) speechEvent(id, "end", "", false, "");
    }

    private void speechEvent(String id, String type, String text, boolean complete, String error) {
        emit("rcm-native-speech", json("requestId", id, "type", type, "transcript", text, "final", complete, "error", error));
    }

    private boolean showNotification(JSONObject data) {
        Uri target = Uri.parse(data.optString("url"));
        if (!isAppUrl(target) || !NotificationManagerCompat.from(activity).areNotificationsEnabled()) return false;
        if (Build.VERSION.SDK_INT >= 33 && activity.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                NotificationManager manager = activity.getSystemService(NotificationManager.class);
                manager.createNotificationChannel(new NotificationChannel(CHANNEL, data.optString("channelName", "RCM"), NotificationManager.IMPORTANCE_DEFAULT));
            }
            String tag = data.optString("tag", "rcm-update");
            Intent open = new Intent(activity, MainActivity.class).setData(target)
                    .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent click = PendingIntent.getActivity(activity, tag.hashCode(), open,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            NotificationCompat.Builder notice = new NotificationCompat.Builder(activity, CHANNEL)
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle(data.optString("title", "RCM"))
                    .setContentText(data.optString("body"))
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(data.optString("body")))
                    .setContentIntent(click).setAutoCancel(true);
            NotificationManagerCompat.from(activity).notify(tag, 0, notice.build());
            return true;
        } catch (Exception error) { return false; }
    }

    private void respond(String id, boolean success) { emit("rcm-native-response", json("requestId", id, "success", success)); }
    private JSONObject json(Object... entries) {
        JSONObject result = new JSONObject();
        try { for (int i = 0; i < entries.length; i += 2) result.put((String) entries[i], entries[i + 1]); }
        catch (Exception ignored) { }
        return result;
    }
    private void emit(String event, JSONObject data) {
        if (!destroyed && !activity.isFinishing()) webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent(" + JSONObject.quote(event) + ",{detail:" + data + "}));", null);
    }
    void pauseSpeech() {
        String id = speechId.isEmpty() ? pendingSpeechId : speechId;
        if (!id.isEmpty()) speechEvent(id, "error", "", false, "aborted");
        cancelSpeech();
    }
    void destroy() { cancelSpeech(); destroyed = true; }
}
