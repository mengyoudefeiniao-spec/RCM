package iq.gov.mot.rcm;

import android.webkit.JavascriptInterface;

/**
 * Exposes the Gradle build flavor to the bundled web application so the
 * citizen and agent APKs always use their own login and registration flows.
 */
public final class AppRoleBridge {
    private final String appRole;

    public AppRoleBridge(String appRole) {
        this.appRole = appRole;
    }

    @JavascriptInterface
    public String getAppRole() {
        return appRole;
    }
}
