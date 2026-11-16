import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const bundledJdk = 'C:/Program Files/Java/jdk-17.0.8';
const javaHome = process.env.JAVA_HOME || (existsSync(bundledJdk) ? bundledJdk : '');
const command = name => javaHome ? path.join(javaHome, 'bin', name + (process.platform === 'win32' ? '.exe' : '')) : name;
const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'rcm-map-network-'));

before(() => {
  const probe = path.join(temporaryRoot, 'MapResourceProbe.java');
  writeFileSync(probe, `package iq.gov.mot.rcm;
import java.net.URI;
public class MapResourceProbe {
  public static void main(String[] args) throws Exception {
    for (int i = 0; i < args.length; i += 3) {
      URI uri = new URI(args[i]);
      System.out.println(RemoteResourcePolicy.allows(uri.getScheme(), uri.getHost(), uri.getPort(), args[i + 1], uri.getPath(), args[i + 2]));
    }
  }
}`);
  execFileSync(command('javac'), ['-d', temporaryRoot,
    path.join(root, 'app-package/android/app/src/main/java/iq/gov/mot/rcm/RemoteResourcePolicy.java'), probe], { stdio: 'pipe' });
});

after(() => {
  assert.equal(path.dirname(temporaryRoot), path.resolve(tmpdir()));
  assert.ok(path.basename(temporaryRoot).startsWith('rcm-map-network-'));
  rmSync(temporaryRoot, { recursive: true, force: true });
});

function check(cases) {
  const result = execFileSync(command('java'), ['-cp', temporaryRoot, 'iq.gov.mot.rcm.MapResourceProbe',
    ...cases.flatMap(({ url, method = 'GET', backend = 'pb.51xyu.com' }) => [url, method, backend])], { encoding: 'utf8' }).trim().split(/\r?\n/);
  assert.deepEqual(result, cases.map(({ allowed }) => String(allowed)));
}

test('Android permits map tiles and route requests used by both app flavors', () => {
  check([
    ...['', 'a.', 'b.', 'c.'].map(prefix => ({ url: `https://${prefix}tile.openstreetmap.org/15/20421/13164.png`, allowed: true })),
    ...['a', 'b', 'c', 'd'].flatMap(prefix => ['', '@2x'].map(retina => ({ url: `https://${prefix}.basemaps.cartocdn.com/rastertiles/voyager/6/39/25${retina}.png`, allowed: true }))),
    { url: 'https://router.project-osrm.org/route/v1/driving/44.32,33.30;44.35,33.31?overview=full&geometries=geojson', allowed: true },
    { url: 'https://A.TILE.OPENSTREETMAP.ORG:443/15/20421/13164.png', allowed: true }
  ]);
});

test('map resources remain read-only and restricted to the actual HTTPS endpoints', () => {
  check([
    'http://a.tile.openstreetmap.org/15/1/1.png',
    'https://a.tile.openstreetmap.org:8443/15/1/1.png',
    'https://a.tile.openstreetmap.org.evil.example/15/1/1.png',
    'https://evil.example/a.tile.openstreetmap.org/15/1/1.png',
    'https://maps.tile.openstreetmap.org/15/1/1.png',
    'https://a.tile.openstreetmap.org/index.html',
    'https://a.basemaps.cartocdn.com/unrelated/index.html',
    'https://router.project-osrm.org/unrelated',
    'https://www.google.com/maps/dir/?api=1',
    'file:///15/1/1.png'
  ].map(url => ({ url, allowed: false })).concat([
    { url: 'https://a.tile.openstreetmap.org/15/1/1.png', method: 'POST', allowed: false },
    { url: 'https://router.project-osrm.org/route/v1/driving/1,2;3,4', method: 'POST', allowed: false }
  ]));
});

test('PocketBase retains read/write support with the configured deployment host', () => {
  check([
    ...['GET', 'POST', 'PATCH', 'DELETE'].map(method => ({ url: 'https://pb.51xyu.com/api/collections/app_data/records', method, allowed: true })),
    { url: 'https://custom.example:8443/api/files/app_files/example/photo.png', backend: 'custom.example', allowed: true },
    { url: 'http://pb.51xyu.com/api/collections/app_data/records', allowed: false },
    { url: 'https://pb.51xyu.com.evil.example/api/collections/app_data/records', allowed: false },
    { url: 'https://pb.51xyu.com/api/collections/app_data/records', backend: 'custom.example', allowed: false }
  ]);
});

test('tile URLs from the affected screens pass the native policy', () => {
  const screens = [
    'src/components/common/WarehouseLocationDialog.vue',
    'src/views/warehouse/AgentDeliveryOrderDetail.vue',
    'src/views/warehouse/components/RationPlanTab.vue',
    'src/views/agent/components/AgentRealGISMap.vue'
  ];
  const cases = screens.map(screen => {
    const template = readFileSync(path.join(root, screen), 'utf8').match(/L\.tileLayer\('([^']+)'/)?.[1];
    assert.ok(template, 'Map tiles configured for ' + screen);
    const values = { s: 'a', z: '15', x: '20421', y: '13164', r: '@2x' };
    return { url: template.replace(/\{(\w+)\}/g, (_, key) => values[key]), allowed: true };
  });
  check(cases);
});
