import { Platform, PermissionsAndroid } from 'react-native';

type MediaKinds = {
  images?: boolean;
  video?: boolean;
  audio?: boolean;
};

export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestReadMediaPermissions(kinds: MediaKinds = { images: true, video: true }): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);

  if (apiLevel >= 33) {
    const toRequest: string[] = [];
    if (kinds.images) toRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
    if (kinds.video) toRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
    if (kinds.audio) toRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);

    if (toRequest.length === 0) return true;

    const results = await PermissionsAndroid.requestMultiple(toRequest);
    return toRequest.every(p => results[p] === PermissionsAndroid.RESULTS.GRANTED);
  }

  // API 32 and below: use legacy read-only permission
  const res = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
  );
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

// Note: Writing media should be done via MediaStore (or libraries that use SAF/MediaStore).
// No broad write permission is required on modern Android.



