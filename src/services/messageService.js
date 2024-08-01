import axios from 'axios';

export const sendMessage = async (phoneNumber, message, whatsappUrl) => {
  try {
    const response = await axios.post(whatsappUrl, {
      phoneNumber: phoneNumber,
      message: message
    });
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
