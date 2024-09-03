# udemy-ADVANCED-REACT-TESTING

Code to support the Udemy course [Advanced React Testing: Redux Saga and React Router](https://www.udemy.com/course/advanced-react-testing/?couponCode=ADV-TEST-GITHUB)


## Important Changes

### OpenSSL Compatibility

The `scripts` section in `package.json` includes the `NODE_OPTIONS` environment variable set to `--openssl-legacy-provider`. This is necessary to ensure compatibility with OpenSSL changes in Node.js v17 and later, which otherwise cause errors related to digital envelope routines. This setting forces Node.js to use the legacy OpenSSL provider, allowing older libraries and tools to function correctly.

```json
"scripts": {
  "start": "export NODE_OPTIONS=--openssl-legacy-provider && react-scripts start",
  "build": "export NODE_OPTIONS=--openssl-legacy-provider && react-scripts build",
  "test": "export NODE_OPTIONS=--openssl-legacy-provider && react-scripts test"
}