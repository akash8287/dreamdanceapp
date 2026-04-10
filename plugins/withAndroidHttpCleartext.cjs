/**
 * Chrome allows HTTP to your API; the RN Android app uses OkHttp, which follows
 * network_security_config strictly. This plugin forces cleartext HTTP to work in release APKs.
 */
const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const NETWORK_SECURITY_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
      <certificates src="system" />
    </trust-anchors>
  </base-config>
</network-security-config>
`;

function withAndroidHttpCleartext(config) {
  config = withDangerousMod(config, [
    'android',
    async (c) => {
      const root = c.modRequest.platformProjectRoot;
      const xmlDir = path.join(root, 'app', 'src', 'main', 'res', 'xml');
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(
        path.join(xmlDir, 'network_security_config.xml'),
        NETWORK_SECURITY_XML,
        'utf8'
      );
      return c;
    },
  ]);

  return withAndroidManifest(config, async (cfg) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      cfg.modResults
    );
    application.$['android:usesCleartextTraffic'] = 'true';
    application.$['android:networkSecurityConfig'] =
      '@xml/network_security_config';
    return cfg;
  });
}

module.exports = withAndroidHttpCleartext;
