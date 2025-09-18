// app/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ethers } from "ethers";

const REGISTRY_ADDRESS = "0xb35E4C064B6c4153262de38B26CA452A18CB795e";
const RPC_URL =
  "https://polygon-amoy.g.alchemy.com/v2/czOBdj_iSFWr3k8kJyyOk"; // Replace with your RPC

const REGISTRY_ABI = [
  {
    inputs: [{ internalType: "string", name: "aadhar", type: "string" }],
    name: "getUserByAadhar",
    outputs: [
      { internalType: "string", name: "userId", type: "string" },
      { internalType: "string", name: "passport", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "gender", type: "string" },
      { internalType: "uint8", name: "age", type: "uint8" },
      { internalType: "string", name: "nationality", type: "string" },
      { internalType: "string", name: "destination", type: "string" },
      { internalType: "address", name: "issuer", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "userId", type: "string" }],
    name: "getUserById",
    outputs: [
      { internalType: "string", name: "", type: "string" },
      { internalType: "string", name: "passport", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "gender", type: "string" },
      { internalType: "uint8", name: "age", type: "uint8" },
      { internalType: "string", name: "nationality", type: "string" },
      { internalType: "string", name: "destination", type: "string" },
      { internalType: "address", name: "issuer", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "aadhar", type: "string" },
      { internalType: "bytes32", name: "passwordHash", type: "bytes32" },
    ],
    name: "verifyPassword",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "userId", type: "string" }],
    name: "getAadharByUserId",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [userDetails, setUserDetails] = useState<any>(null);

  async function loginUser() {
    try {
      if (!userId || !password) {
        setStatus("⚠️ Please enter both UserID and Password");
        return;
      }

      setStatus("🔗 Connecting to RPC...");

      // ✅ Use JsonRpcProvider directly (React Native doesn't support window.ethereum)
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

      const registry = new ethers.Contract(
        REGISTRY_ADDRESS,
        REGISTRY_ABI,
        provider
      );

      // 1️⃣ Fetch details (read-only)
      const details = await registry.getUserById(userId);

      // 2️⃣ Get Aadhar from userId
      let aadhar: string;
      try {
        aadhar = await registry.getAadharByUserId(userId);
      } catch (e) {
        setStatus("❌ Contract missing getAadharByUserId. Please add it.");
        return;
      }

      // 3️⃣ Hash password
      const passwordHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(password)
      );

      // 4️⃣ Verify password
      const isValid = await registry.verifyPassword(aadhar, passwordHash);

      if (!isValid) {
        setStatus("❌ Invalid password. Please try again.");
        setUserDetails(null);
        return;
      }

      setStatus("✅ Login successful!");
      setUserDetails(details);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error: " + (err.message || "Unknown error"));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>User Login</Text>

      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={loginUser}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.status}>{status}</Text>

      {userDetails && (
        <View style={styles.detailsBox}>
          <Text style={styles.subHeading}>User Details</Text>
          <Text>
            <Text style={styles.bold}>Name:</Text> {userDetails[2]}
          </Text>
          <Text>
            <Text style={styles.bold}>Passport:</Text> {userDetails[1]}
          </Text>
          <Text>
            <Text style={styles.bold}>Gender:</Text> {userDetails[3]}
          </Text>
          <Text>
            <Text style={styles.bold}>Age:</Text> {userDetails[4].toString()}
          </Text>
          <Text>
            <Text style={styles.bold}>Nationality:</Text> {userDetails[5]}
          </Text>
          <Text>
            <Text style={styles.bold}>Destination:</Text> {userDetails[6]}
          </Text>
          <Text>
            <Text style={styles.bold}>Issuer:</Text> {userDetails[7]}
          </Text>
        </View>
      )}
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
  detailsBox: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    width: "100%",
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
});
