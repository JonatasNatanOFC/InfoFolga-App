import {
  NavigatorScreenParams,
  CompositeScreenProps,
} from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type AuthStackParamList = {
  Login: undefined;
};

export type FuncionariosStackParamList = {
  FuncionariosList: undefined;
  FuncionarioDetalhes: { funcionarioId: number };
};

export type ManagerTabParamList = {
  Inicio: undefined;
  Solicitacoes: undefined;
  Funcionarios: NavigatorScreenParams<FuncionariosStackParamList>;
  Relatorios: undefined;
};

export type FuncionariosStackScreenProps<T extends keyof FuncionariosStackParamList> =
    CompositeScreenProps<
      StackScreenProps<FuncionariosStackParamList, T>,
      ManagerTabScreenProps<"Funcionarios">
    >;

export type EmployeeTabParamList = {
  Home: { nomeUsuario: string };
};

export type AppStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ManagerApp: NavigatorScreenParams<ManagerTabParamList>;
  EmployeeApp: NavigatorScreenParams<EmployeeTabParamList>;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    StackScreenProps<AuthStackParamList, T>,
    StackScreenProps<AppStackParamList>
  >;

export type ManagerTabScreenProps<T extends keyof ManagerTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<ManagerTabParamList, T>,
    StackScreenProps<AppStackParamList>
  >;

export type EmployeeTabScreenProps<T extends keyof EmployeeTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<EmployeeTabParamList, T>,
    StackScreenProps<AppStackParamList>
  >;
