import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

interface Props {
  item: any;
  mostrarAcoes?: boolean;
  onAprovar?: () => void;
  onRejeitar?: () => void;
}

function formatarData(data: string) {
  if (!data) return "-";
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

const SolicitacaoCard: React.FC<Props> = ({
  item,
  mostrarAcoes = false,
  onAprovar,
  onRejeitar,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              item.funcionarioFoto ||
              "https://via.placeholder.com/100x100.png?text=User",
          }}
          style={styles.avatar}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.nome}>{item.funcionarioNome}</Text>
          <Text style={styles.subInfo}>
            {item.funcionarioSetor || "Sem setor"}
          </Text>
          <Text style={styles.subInfo}>
            {item.funcionarioCargo || "Sem cargo"}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.tipo}>
          {item.tipo} • {formatarData(item.dataInicio)}
          {item.dataFim && item.dataFim !== item.dataInicio
            ? ` até ${formatarData(item.dataFim)}`
            : ""}
        </Text>

        <Text style={styles.motivo}>
          {item.motivo || "Sem motivo informado"}
        </Text>

        {item.motivoResposta ? (
          <View style={styles.respostaBox}>
            <Text style={styles.respostaTitulo}>Motivo da rejeição</Text>
            <Text style={styles.respostaTexto}>{item.motivoResposta}</Text>
          </View>
        ) : null}
      </View>

      {mostrarAcoes && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.aprovar]}
            onPress={onAprovar}
          >
            <Text style={styles.buttonText}>Aprovar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.rejeitar]}
            onPress={onRejeitar}
          >
            <Text style={styles.buttonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SolicitacaoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#eee",
  },
  infoContainer: {
    marginLeft: 14,
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  subInfo: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  body: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
  },
  tipo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007bff",
  },
  motivo: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  respostaBox: {
    marginTop: 12,
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  respostaTitulo: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b91c1c",
    marginBottom: 4,
  },
  respostaTexto: {
    fontSize: 13,
    color: "#7f1d1d",
  },
  actions: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  aprovar: {
    backgroundColor: "#22c55e",
  },
  rejeitar: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
