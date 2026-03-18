import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export interface RequestCardProps {
  id: number;
  employeeName: string;
  leaveDate: string;
  onApprove: (id: number) => void;
  onDeny: (id: number) => void;
}

const PendingRequestCard: React.FC<RequestCardProps> = ({
  id,
  employeeName,
  leaveDate,
  onApprove,
  onDeny,
}) => {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.employeeName}>{employeeName}</Text>
        <Text style={styles.leaveDate}>Data da Folga: {leaveDate}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.denyButton]}
          onPress={() => onDeny(id)}
        >
          <Text style={styles.buttonText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={() => onApprove(id)}
        >
          <Text style={styles.buttonText}>Aprovar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  employeeName: { fontSize: 18, fontWeight: "bold" },
  leaveDate: { fontSize: 16, color: "#666", marginTop: 4 },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  approveButton: { backgroundColor: "#28a745" },
  denyButton: { backgroundColor: "#dc3545" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});

export default PendingRequestCard;
