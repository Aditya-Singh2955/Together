import { Audio } from "expo-av";
import { Toast } from "toastify-react-native";

const SUCCESS_SOUND = require("../../assets/faaa_1sec.mp3");
const ERROR_SOUND = require("../../assets/yooo.mp3");

async function playSound(requiredSound) {
  try {
    const { sound } = await Audio.Sound.createAsync(requiredSound);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
  }
}

export function showSuccessToast(message, position) {
  playSound(SUCCESS_SOUND);
  Toast.success(message, position);
}

export function showErrorToast(message, position) {
  playSound(ERROR_SOUND);
  Toast.error(message, position);
}

export async function playOuchSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(require("../../assets/Ouch.mp3"));
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
  }
}

export async function playWowSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(require("../../assets/wow.mp3"));
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
  }
}

export const ToastSounds = {
  success: showSuccessToast,
  error: showErrorToast,
};
