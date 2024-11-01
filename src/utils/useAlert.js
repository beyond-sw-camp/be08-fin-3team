import { ref } from 'vue';
import { useRouter } from 'vue-router';

export function useAlert() {
  const alertMessage = ref('');
  const showAlert = ref(false);
  const alertType = ref('');
  const router = useRouter();

  function triggerAlert(message, type = 'success', duration = 2000, redirectPath = null) {
    alertMessage.value = message;
    alertType.value = type;
    showAlert.value = true;
    console.log("triggerAlert 확인:", message, type, showAlert.value);

    setTimeout(() => {
      showAlert.value = false;
      if (redirectPath) {
        router.push(redirectPath);
      }
    }, duration);
  }

  return {
    alertMessage,
    showAlert,
    alertType,
    triggerAlert,
  };
}
