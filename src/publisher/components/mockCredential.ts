export const mockCredential = `
{
  "@id": "https://demo-vc-2.inrupt.net/profile/card#cred",
  "http://dig.csail.mit.edu/2018/svc#description": [
      {
          "@value": "Congratulations! By the powers vested in me as Issuer with ID 'https://michielbdejong.inrupt.net/profile/card#me', I hereby grant Subject with ID 'https://demo-vc-2.inrupt.net/profile/card#me' a credential of type GENERAL"
      }
  ],
  "http://dig.csail.mit.edu/2018/svc#domain": [
      {
          "@value": "GENERAL"
      },
      {
          "@value": "some domain"
      }
  ],
  "http://dig.csail.mit.edu/2018/svc#id": [
      {
          "@value": "1234567"
      },
      {
          "@value": "undefined338114686478150"
      }
  ],
  "http://dig.csail.mit.edu/2018/svc#issuerId": [
      {
          "@value": "https://michielbdejong.inrupt.net/profile/card#me"
      },
      {
          "@id": "https://demo-vc-2.inrupt.net/profile/card#me"
      }
  ],
  "http://dig.csail.mit.edu/2018/svc#messageType": [
      {
          "@value": "ISSUANCE"
      }
  ],
  "http://dig.csail.mit.edu/2018/svc#subjectId": [
      {
          "@value": "https://demo-vc-2.inrupt.net/profile/card#me"
      },
      {
          "@id": "https://demo-vc-2.inrupt.net/profile/card#me"
      }
  ],
  "http://dig.csail.mit.edu/2018/svc#title": [
      {
          "@value": "GENERAL Credential for Subject with ID 'https://demo-vc-2.inrupt.net/profile/card#me'"
      },
      {
          "@value": "testing this"
      }
  ],
  "@type": [
      "http://dig.csail.mit.edu/2018/svc#Credential"
  ],
  "https://w3id.org/credentials/v1#credentialStatus": [
      {
          "@value": "undefined338114686478150.n3"
      }
  ],
  "https://w3id.org/security#proof": {
      "@graph": {
          "@type": "https://w3id.org/security#RsaSignature2018",
          "http://purl.org/dc/terms/created": {
              "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
              "@value": "2019-09-23T12:40:01Z"
          },
          "https://w3id.org/security#jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Y2tijVRkOBQQ87dlkRl5_bfTIiwgdMQVyT5rpMOM2iYinBxKtX-YGATXM2H7LkmYP6QJIWPwKKCelWyMhlqN2Hobq8WKDkSl3fk5KBVL8Wrq9zG02XcJa90eKG5kWr-FD00pNBTP3v6DtfDyxN8sBXqsXtDL_ErbznMVMEvOP7t7D0fIQiP5sD2qFPi576vhKqD4I-81sQ6otkwTT4VpiIhUTmTrburAi07HrH6pG8U1AeHBeSw4rVQVYggRiCPE4NR4MV2DvNMBEWiJMPhD88Tu2Osl_iy8qVNLJhjSFiXLyCh3oFYV8yYFpO_Ls5iyXWs7Fgp4lQ8wSlDIx5M9fQ",
          "https://w3id.org/security#proofPurpose": {
              "@id": "https://w3id.org/security#assertionMethod"
          }
      }
  }
}
`;