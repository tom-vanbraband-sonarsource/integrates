/* tslint:disable:no-any
 * Disabling this rule is necessary because the payload type may differ between
 * actions
 */
import { AxiosError, AxiosResponse } from "axios";
import { Action, AnyAction, Dispatch } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { msgError, msgErrorStick, msgSuccess } from "../../utils/notifications";
import rollbar from "../../utils/rollbar";
import translate from "../../utils/translations/translate";
import Xhr from "../../utils/xhr";
import * as actionType from "./actionTypes";

export interface IActionStructure {
  payload: any;
  type: string;
}

export type ThunkDispatcher = Dispatch<Action> & ThunkDispatch<{}, {}, AnyAction>;
type ThunkActionStructure = ((...args: any[]) => ThunkAction<void, {}, {}, AnyAction>);

const formatError: (errorName: string, errorValue: string) => string =
  (errorName: string, errorValue: string): string =>
    (` ${translate.t(errorName)} ${errorValue} ${translate.t("proj_alerts.invalid")}. `);

export const updateVulnerabilities: ThunkActionStructure =
  (findingId: string): ThunkAction<void, {}, {}, Action> => (_: ThunkDispatcher): void => {
    let gQry: string;
    gQry = `mutation {
      uploadFile(findingId: "${findingId}") {
        success
      }
    }`;
    new Xhr().upload(gQry, "#vulnerabilities", "An error occurred updating vulnerabilities")
      .then((response: AxiosResponse) => {
        const { data } = response.data;

        if (data.uploadFile.success) {
          msgSuccess(
            translate.t("proj_alerts.file_updated"),
            translate.t("proj_alerts.title_success"));
          location.reload();
        } else {
          msgError(translate.t("proj_alerts.error_textsad"));
        }
      })
      .catch((error: AxiosError) => {
        if (error.response !== undefined) {
          const { errors } = error.response.data;

          if (errors[0].message.includes("Exception - Error in range limit numbers")) {
            msgError(translate.t("proj_alerts.range_error"));
          } else if (errors[0].message.includes("Exception - Invalid Schema")) {
            const errorMessage: string = errors[0].message.replace("Exception - Invalid Schema", "");
            if (errorMessage !== "") {
              const listErrors: string[] = errorMessage.split("|||");
              const listKeysErrors: string[] = listErrors[0].split("||");
              const listValuesErrors: string[] = listErrors[1].split("||");
              const listValuesFormated: string[] = listValuesErrors.map(
                (x: string) => x !== "" ? formatError("proj_alerts.value", x) : "");
              const listKeysFormated: string[] = listKeysErrors.map(
                (x: string) => x !== "" ? formatError("proj_alerts.key", x) : "");
              msgErrorStick(
                listKeysFormated.join("") + listValuesFormated.join(""),
                translate.t("proj_alerts.invalid_schema"));
            } else {
              msgError(translate.t("proj_alerts.invalid_schema"));
            }
          } else if (errors[0].message.includes("Exception - Invalid File Size")) {
            msgError(translate.t("proj_alerts.file_size_py"));
          } else if (errors[0].message === "Exception - Invalid File Type") {
            msgError(translate.t("proj_alerts.file_type_yaml"));
          } else if (errors[0].message.includes("Exception - Error in path value")) {
            msgError(translate.t("proj_alerts.path_value"));
          } else if (errors[0].message.includes("Exception - Error in port value")) {
            msgError(translate.t("proj_alerts.port_value"));
          } else if (errors[0].message.includes("Exception - Error in specific value")) {
            msgError(translate.t("proj_alerts.port_value"));
          } else {
            msgError(translate.t("proj_alerts.invalid_specific"));
            rollbar.error(error.message, errors);
          }
        }
      });
  };

export const openConfirmDialog: ((dialogName: string) => IActionStructure) =
  (dialogName: string): IActionStructure => ({
    payload: { dialogName },
    type: actionType.OPEN_CONFIRM_DIALOG,
  });

export const closeConfirmDialog: ((dialogName: string) => IActionStructure) =
  (dialogName: string): IActionStructure => ({
    payload: { dialogName },
    type: actionType.CLOSE_CONFIRM_DIALOG,
  });
