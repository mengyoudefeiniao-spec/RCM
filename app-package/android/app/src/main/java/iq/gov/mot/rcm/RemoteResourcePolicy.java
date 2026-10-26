package iq.gov.mot.rcm;

import java.util.Locale;

/** Network resources used by the bundled app; external pages stay outside its WebView. */
final class RemoteResourcePolicy {
    private RemoteResourcePolicy() {}

    static boolean allows(String scheme, String host, int port, String method, String path,
                          String pocketBaseHost) {
        if (!"https".equalsIgnoreCase(scheme) || host == null) return false;
        if (host.equalsIgnoreCase(pocketBaseHost)) return true;
        if ((port != -1 && port != 443) || !"GET".equals(method) || path == null) return false;

        String hostname = host.toLowerCase(Locale.ROOT);
        switch (hostname) {
            case "tile.openstreetmap.org":
            case "a.tile.openstreetmap.org":
            case "b.tile.openstreetmap.org":
            case "c.tile.openstreetmap.org":
                return path.matches("/\\d+/\\d+/\\d+\\.png");
            case "a.basemaps.cartocdn.com":
            case "b.basemaps.cartocdn.com":
            case "c.basemaps.cartocdn.com":
            case "d.basemaps.cartocdn.com":
                return path.matches("/rastertiles/voyager/\\d+/\\d+/\\d+(@2x)?\\.png");
            case "router.project-osrm.org":
                return path.startsWith("/route/v1/driving/");
            default:
                return false;
        }
    }
}
