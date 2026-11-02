# Google sign-in button

`sign-in-with-google-light.png` is Google's official "Sign in with Google" button: light theme, square shape, Android + Web, PNG @4x (720×160, shown at 4.5:1).

- Source: https://developers.google.com/static/identity/images/signin-assets.zip
- Rules: https://developers.google.com/identity/branding-guidelines — do not recolor, crop or stretch it; scale only with its aspect ratio.
- The bundle also has iOS versions with different padding. Use those when the iOS app gets Google sign-in.
- The PNG is used instead of the SVG because the SVG's "G" relies on `foreignObject` and blur filters, which native SVG renderers do not draw.
