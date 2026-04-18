import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { EmployeeTabScreenProps } from "../navigation/types";
import {
  criarSolicitacao,
  TipoSolicitacao,
} from "../services/solicitacaoService";
import AppHeader from "../components/AppHeader";
import DateField from "../components/DateField";
import TipoSolicitacaoSelector from "../components/TipoSolicitacaoSelector";

const NovaSolicitacaoScreen: React.FC<
  EmployeeTabScreenProps<"NovaSolicitacao">
> = ({ navigation }) => {
  const [tipo, setTipo] = useState<TipoSolicitacao>("FOLGA");
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  const dataMinima = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const min = new Date(hoje);
    min.setDate(min.getDate() + 2);
    return min;
  }, []);

  function toDateOnlyString(date: Date) {
    const ajustada = new Date(date);
    ajustada.setHours(12, 0, 0, 0);
    return ajustada.toISOString().split("T")[0];
  }

  function validarRegras(): boolean {
    if (!dataInicio) {
      Alert.alert("Erro", "Selecione a data inicial.");
      return false;
    }

    if (dataInicio < dataMinima) {
      Alert.alert(
        "Regra de negócio",
        "A solicitação deve ser feita com pelo menos 2 dias de antecedência.",
      );
      return false;
    }

    if (tipo === "FOLGA") {
      if (dataFim && dataInicio.getTime() !== dataFim.getTime()) {
        Alert.alert(
          "Regra de negócio",
          "Folga só pode ser solicitada para 1 único dia.",
        );
        return false;
      }
    }

    if (tipo === "FERIAS") {
      if (!dataFim) {
        Alert.alert("Erro", "Selecione a data final.");
        return false;
      }

      if (dataFim < dataInicio) {
        Alert.alert(
          "Erro",
          "A data final não pode ser anterior à data inicial.",
        );
        return false;
      }
    }

    return true;
  }

  function handleChangeTipo(novoTipo: TipoSolicitacao) {
    setTipo(novoTipo);

    if (novoTipo === "FOLGA" && dataInicio) {
      setDataFim(dataInicio);
    }
  }

  function handleChangeDataInicio(date: Date) {
    setDataInicio(date);

    if (tipo === "FOLGA") {
      setDataFim(date);
    } else if (dataFim && dataFim < date) {
      setDataFim(date);
    }
  }

  async function handleSalvar() {
    if (!validarRegras()) return;

    setSaving(true);

    try {
      const inicio = toDateOnlyString(dataInicio!);
      const fim = tipo === "FOLGA" ? inicio : toDateOnlyString(dataFim!);

      await criarSolicitacao({
        tipo,
        dataInicio: inicio,
        dataFim: fim,
        motivo: motivo.trim(),
      });

      Alert.alert("Sucesso", "Solicitação enviada com sucesso.");

      setTipo("FOLGA");
      setDataInicio(null);
      setDataFim(null);
      setMotivo("");

      navigation.navigate("MinhasSolicitacoes");
    } catch (error: any) {
      const backMessage =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        "Não foi possível enviar a solicitação.";

      Alert.alert("Erro", backMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Nova Solicitação" />

      <ScrollView contentContainerStyle={styles.content}>
        <TipoSolicitacaoSelector tipo={tipo} onChange={handleChangeTipo} />

        <DateField
          label={tipo === "FOLGA" ? "Data da folga" : "Data inicial"}
          value={dataInicio}
          onChange={handleChangeDataInicio}
          minimumDate={dataMinima}
        />

        {tipo === "FERIAS" && (
          <DateField
            label="Data final"
            value={dataFim}
            onChange={setDataFim}
            minimumDate={dataInicio || dataMinima}
            disabled={!dataInicio}
          />
        )}

        {tipo === "FOLGA" && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              • Folga só pode ser solicitada para 1 dia
            </Text>
            <Text style={styles.infoText}>
              • Pedido precisa ser feito com pelo menos 2 dias de antecedência
            </Text>
          </View>
        )}

        <Text style={styles.label}>Motivo</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={motivo}
          onChangeText={setMotivo}
          placeholder="Descreva o motivo"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSalvar}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Enviar solicitação</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default NovaSolicitacaoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#222",
    borderWidth: 1,
    borderColor: "#e3e6ea",
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  infoBox: {
    marginTop: 14,
    backgroundColor: "#fff8e1",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffe08a",
    padding: 12,
  },
  infoText: {
    color: "#7a5a00",
    fontSize: 13,
    marginBottom: 4,
  },
  saveButton: {
    marginTop: 26,
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
