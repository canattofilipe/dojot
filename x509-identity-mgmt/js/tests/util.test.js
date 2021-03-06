const faker = require('faker');

const pemCertHeader = '-----BEGIN CERTIFICATE-----';
const pemCertFooter = '-----END CERTIFICATE-----';

const pemCSRHeader = '-----BEGIN CERTIFICATE REQUEST-----';
const pemCSRFooter = '-----END CERTIFICATE REQUEST-----';

const pemLineMaxLength = 64 + 1; /* +1 = line feed character */

function generatePemDummy(pemHeader, pemFooter, maxLength = 65536) {
  const payloadLength = maxLength - (pemHeader.length + '\n'.length + pemFooter.length);
  const lastLineLength = payloadLength % pemLineMaxLength;
  const payloadLines = (payloadLength - lastLineLength) / pemLineMaxLength;
  const payload = [];
  for (let i = 0; i < payloadLines; i += 1) {
    payload[i] = faker.random.alphaNumeric(pemLineMaxLength - 1);
  }
  payload.push(faker.random.alphaNumeric(lastLineLength));
  payload.unshift(pemHeader);
  payload.push(pemFooter);
  return payload.join('\n');
}

function generateCert(maxLength) {
  return generatePemDummy(pemCertHeader, pemCertFooter, maxLength);
}

function generateCSR(maxLength) {
  return generatePemDummy(pemCSRHeader, pemCSRFooter, maxLength);
}

const p256CSR = `-----BEGIN CERTIFICATE REQUEST-----
MIHiMIGKAgEAMCgxJjAkBgNVBAMMHVRlc3RlIGRlIGNoYXZlIEVDQyBwcmltZTI1
NnYxMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5fToDq5JoLuJLSRejfeRNJeh
PZD/zS9F1eQ2M1zJheplKbAeffdcpLSTwiPbA16Xm8hB740+zcHmik/Uy1i+S6AA
MAoGCCqGSM49BAMCA0cAMEQCIE08Ln3OGjFkxOd+3QJE6cml+lAj1XmnpcwDf5Md
RUMKAiAbiyibnE0sv1X4byQ4Y8bsQvdNZQqZFMmgFwKldowOvg==
-----END CERTIFICATE REQUEST-----`;

const p256Cert = `-----BEGIN CERTIFICATE-----
MIIGQjCCBCqgAwIBAgIUSGKCwD6e1WMEhpgzcNp+y2mgWswwDQYJKoZIhvcNAQEL
BQAwejEjMCEGCgmSJomT8ixkAQEME2MtMDY1MmZlNGIzYmFkMTk0ZGYxGTAXBgNV
BAMMEFg1MDkgSWRlbnRpdHkgQ0ExGzAZBgNVBAsMEkNlcnRpZmljYXRlIElzc3Vl
cjEbMBkGA1UECgwSZG9qb3QgSW9UIFBsYXRmb3JtMB4XDTIwMDUxNDE5NTAwMFoX
DTIxMDUxNDE5NTAwMFowRTEbMBkGA1UECgwSZG9qb3QgSW9UIFBsYXRmb3JtMSYw
JAYDVQQDDB1UZXN0ZSBkZSBjaGF2ZSBFQ0MgcHJpbWUyNTZ2MTBZMBMGByqGSM49
AgEGCCqGSM49AwEHA0IABOX06A6uSaC7iS0kXo33kTSXoT2Q/80vRdXkNjNcyYXq
ZSmwHn33XKS0k8Ij2wNel5vIQe+NPs3B5opP1MtYvkujggK+MIICujAMBgNVHRMB
Af8EAjAAMB8GA1UdIwQYMBaAFDF/wCoLtNWdD9UN5nTS7OOwCDDvMIHcBgNVHS4E
gdQwgdEwgc6ggcuggciGgcVodHRwOi8vMTcyLjE5LjAuMwoxNzIuMTguMC4zOjgw
ODAvZWpiY2EvcHVibGljd2ViL3dlYmRpc3QvY2VydGRpc3Q/Y21kPWRlbHRhY3Js
Jmlzc3Vlcj1VSUQlM0RjLTA2NTJmZTRiM2JhZDE5NGRmJTJDQ04lM0RYNTA5JTIw
SWRlbnRpdHklMjBDQSUyQ09VJTNEQ2VydGlmaWNhdGUlMjBJc3N1ZXIlMkNPJTNE
ZG9qb3QlMjBJb1QlMjBQbGF0Zm9ybTAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYB
BQUHAwQwggFaBgNVHR8EggFRMIIBTTCCAUmggcaggcOGgcBodHRwOi8vMTcyLjE5
LjAuMwoxNzIuMTguMC4zOjgwODAvZWpiY2EvcHVibGljd2ViL3dlYmRpc3QvY2Vy
dGRpc3Q/Y21kPWNybCZpc3N1ZXI9VUlEJTNEYy0wNjUyZmU0YjNiYWQxOTRkZiUy
Q0NOJTNEWDUwOSUyMElkZW50aXR5JTIwQ0ElMkNPVSUzRENlcnRpZmljYXRlJTIw
SXNzdWVyJTJDTyUzRGRvam90JTIwSW9UJTIwUGxhdGZvcm2ifqR8MHoxIzAhBgoJ
kiaJk/IsZAEBDBNjLTA2NTJmZTRiM2JhZDE5NGRmMRkwFwYDVQQDDBBYNTA5IElk
ZW50aXR5IENBMRswGQYDVQQLDBJDZXJ0aWZpY2F0ZSBJc3N1ZXIxGzAZBgNVBAoM
EmRvam90IElvVCBQbGF0Zm9ybTAdBgNVHQ4EFgQU6HusqT6OTWtfZEzPKp/Vwg9v
OeAwDgYDVR0PAQH/BAQDAgPoMA0GCSqGSIb3DQEBCwUAA4ICAQAMLF6Tmwklwg3D
ju75sG1i/0WO54YSJCA+NikPDJ5IPhzA7ulxh2rY+PUBu6SBlt1qhG6HHeE6Nnjv
lcDMeH53DfpGNP1hik2nUVJUOej8pw6HKgiDZtDnYSrYLxZyvWd8hOHbqq1fCbCm
e9oXu2PsNFfTJrx+B1B+MJR/Li0GO9ir0+reeGoexp5pLx3unZvD1JRj/3OvLMLX
I9ohvJbGUMFEQrPuy59R070ryGQ6aYNZrIGctl2AIbu3Z+5eHqWiZXtPHd+XGqiI
J/Ztdm0+dEqys/clHLX7vNaXGyyIj8uYz0hfhlx9KTKpYfePWj1rhI4iZZmnH8+Y
pbuRHA/Nyy2QjtvCxTv3x0TNjGZbOw8cRn2+cGSJ+/cj8CzY1B8UXgE1p8Syw6tl
6KfnPF+2sKXKXXcUqm822edgQ247RWyI8/1WRFADFWU5j1uZgCZLfloFclAyZIrF
bNBRGNfSOXgI4p/XOGnxGxLEVh3lTiWO/fVi4vLVp6MvL/QRXSue9GTmaliNKlkY
A8kqWCU6i7xXu3mHe0ahYzFdBm3Vq8Ze+aG8HGW51Q648378JRmeaOg9EmON0cRg
8hAU88V/wSuIcrW+DY97RW1A/DENUNP2Dzw02zdSDl+QJGBdpG1fhrUfmeDy93wh
JnGjd/T1dkjCRizV6Av/9vpHhM435Q==
-----END CERTIFICATE-----`;

const caCert = `-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----`;

const caFingerprint = '8F:B9:73:5D:E6:F1:7E:E1:E3:28:D0:6B:3C:9C:76:12:30:2E:6B:7B:95:21:A3:4C:98:7E:DE:B4:EB:D3:AE:BC';

const caCRL = `-----BEGIN X509 CRL-----
MIIC9DCB3QIBATANBgkqhkiG9w0BAQsFADB6MSMwIQYKCZImiZPyLGQBAQwTYy0w
NThiNGU4NjAzZTg3YjBhNzEZMBcGA1UEAwwQWDUwOSBJZGVudGl0eSBDQTEbMBkG
A1UECwwSQ2VydGlmaWNhdGUgSXNzdWVyMRswGQYDVQQKDBJkb2pvdCBJb1QgUGxh
dGZvcm0XDTIwMDUyMzAyNTEyMFoXDTIwMDUyNDAyNTEyMFqgLzAtMB8GA1UdIwQY
MBaAFDCArAMf8pwoDN/3e58c7bCIrSRSMAoGA1UdFAQDAgEEMA0GCSqGSIb3DQEB
CwUAA4ICAQAZmA/jhX4gOsiw8A8SG6eta6V+gBQcs2K5DR7rh/Z8AimDtX8LwI1E
QRgFhKjhEaniCp9o5IgKlMh2Y7ZNF7U03S8yXI7+f4FLWLgzBIij6Rq5UbTcWfAY
xu/uW+YRSnNv8EM1W+/ZX+/O/HEqnt9CZGbWVADwITentZKg0x/UKKylYsrPHG4Q
Pn0ueG+NXHJsa+nQ+NQOmQjZf6q0XHqjzb/VQA1ZlswqSUTERPaVsUPbGicWG+D2
ETBQWmGyM64V/rX6XxmlFWpWazppvnHlZ3z5sr0MxF1kPp8VYLcGUa8CCnkuIycY
svui6RRc+L+s8rMSst7Onq1CnpPdd44aAw3JeUU9oPABU/WBC8ZgdEwADpL/s/Iz
G/0Izmkv0DKmDhontmwpvdIq0yQOelSoL8429bhbZqbW55weIHtKa3ruiOxPCUu3
x6EmIu7hLpkNzj4LxeVkIJ3FpJSN8M9graVQRBemTFCBsfYfabmni8vp+loLJ/Kf
lYzdxnExRY/ltyk01/XNz2n66JotjGr0Xk8vKe8wwodknK587xA/gMw19eOR2YEi
91j1SBQFwYQjQLuz/S65xRhMFgOBXQX6m22HTTxdYJLmq43xbeS1iXyoH/cY/T+1
0Loq45swNAbyfTo5a3Cm/fncY6WzmFclVrfmg9MTWA6D0OZ7KVcRPg==
-----END X509 CRL-----`;

/* defines the JWT token to be used for test requests */
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  + '.eyJzZXJ2aWNlIjoiYWRtaW4ifQ'
  + '._HY-E8EFWIX-rfyMHktjQ7vzEc-0KqrwvIglQJoRbXo';

module.exports = {
  generateCert,
  generateCSR,
  p256CSR,
  p256Cert,
  token,
  caCert,
  caFingerprint,
  caCRL,
};
