import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Voice from "@react-native-voice/voice";

const VoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (event) => setTranscription(event.value[0]);
    Voice.onSpeechError = (err) => setError(err.error);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setTranscription("");
      setError(null);
      await Voice.start("en-US");
    } catch (e) {
      setError(e.message);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <TouchableOpacity
        onPress={isListening ? stopListening : startListening}
        style={{
          padding: 15,
          backgroundColor: isListening ? "red" : "blue",
          borderRadius: 50,
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          {isListening ? "Stop Listening" : "Start Listening"}
        </Text>
      </TouchableOpacity>

      {isListening && <ActivityIndicator size="large" color="blue" />}

      <Text style={{ marginTop: 20, fontSize: 18, color: "black" }}>
        {transcription || "Say something..."}
      </Text>

      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
};

export default VoiceToText;
