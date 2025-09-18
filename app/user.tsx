import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import {
  WalletConnectModal,
  useWalletConnectModal,
} from "@walletconnect/react-native-dapp";

const projectId = "6234450dfbc7b5723722309b0d4b8655";

const REGISTRY_ADDRESS = "0xb35E4C064B6c4153262de38B26CA452A18CB795e";
const REGISTRY_ABI = [
  {
    inputs: [
      { internalType: "string", name: "aadhar", type: "string" },
      { internalType: "string", name: "passport", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "gender", type: "string" },
      { internalType: "uint8", name: "age", type: "uint8" },
      { internalType: "bytes32", name: "passwordHash", type: "bytes32" },
      { internalType: "string", name: "nationality", type: "string" },
      { internalType: "string", name: "destination", type: "string" },
    ],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function UserRegistration() {
  const [aadhar, setAadhar] = useState("");
  const [passport, setPassport] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [nationality, setNationality] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const { open, provider, isConnected } = useWalletConnectModal();

  useEffect(() => {
    if (provider && isConnected) {
      setStatus("✅ Wallet connected");
    }
  }, [provider, isConnected]);

  async function registerUser() {
    try {
      if (!isConnected || !provider) {
        setStatus("⚡ Please connect your wallet first");
        await open();
        return;
      }

      setLoading(true);
      setStatus("🔗 Redirecting to MetaMask...");

      const ethersProvider = new ethers.providers.Web3Provider(provider as any);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(
        REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer
      );

      const passwordHash = keccak256(toUtf8Bytes(password));

      // 🚀 Just send transaction, don't wait for confirmation
      await contract.registerUser(
        aadhar,
        passport,
        name,
        gender,
        parseInt(age),
        passwordHash,
        nationality,
        destination
      );

      // 🎯 Immediately update UI with user details
      setUserData({
        aadhar,
        passport,
        name,
        gender,
        age,
        nationality,
        destination,
      });

      setStatus("✅ Transaction submitted (details saved locally).");
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>User Registration</Text>

      <TextInput
        style={styles.input}
        placeholder="Aadhar"
        value={aadhar}
        onChangeText={setAadhar}
      />
      <TextInput
        style={styles.input}
        placeholder="Passport"
        value={passport}
        onChangeText={setPassport}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Nationality"
        value={nationality}
        onChangeText={setNationality}
      />
      <TextInput
        style={styles.input}
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={registerUser}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.status}>{status}</Text>

      {/* ✅ Show user details immediately after transaction submit */}
      {userData && (
        <View style={styles.card}>
          <Text style={styles.subheading}>User Details</Text>
          <Text>Aadhar: {userData.aadhar}</Text>
          <Text>Passport: {userData.passport}</Text>
          <Text>Name: {userData.name}</Text>
          <Text>Gender: {userData.gender}</Text>
          <Text>Age: {userData.age}</Text>
          <Text>Nationality: {userData.nationality}</Text>
          <Text>Destination: {userData.destination}</Text>
        </View>
      )}

      {/* WalletConnect modal */}
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={{
          name: "Netra App",
          description: "User Registration dApp",
          url: "https://expo.dev",
          icons: ["https://walletconnect.com/walletconnect-logo.png"],
          redirect: {
            native: "netra://", // your custom scheme
            universal: "https://yourdomain.com/netra",
          },
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#1D3D47",
    padding: 12,
    borderRadius: 6,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  status: {
    marginTop: 20,
    textAlign: "center",
  },
  card: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    width: "100%",
    backgroundColor: "#f9f9f9",
  },
});
