/* tslint:disable jsx-no-lambda number-literal-format jsx-no-multiline-js
 * JSX-NO-LAMBDA: Disabling this rule is necessary for the sake of simplicity and
 * readability of the code that binds click events
 *
 * JSX-NO-MULTILINE-JS: necessary for the sake of readability of the code that dynamically renders fields
 * as input or <p> depending on their state
 */

import { MutationFunction, MutationResult } from "@apollo/react-common";
import { Mutation } from "@apollo/react-components";
import { useMutation } from "@apollo/react-hooks";
import { ApolloError } from "apollo-client";
import { GraphQLError } from "graphql";
import _ from "lodash";
import mixpanel from "mixpanel-browser";
import React from "react";
import { ButtonToolbar, Col, Row } from "react-bootstrap";
import { AnyAction, Reducer } from "redux";
import { formValueSelector, InjectedFormProps } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { StateType } from "typesafe-actions";
import { Button } from "../../../../components/Button/index";
import { ConfirmDialog, ConfirmFn } from "../../../../components/ConfirmDialog";
import { FluidIcon } from "../../../../components/FluidIcon";
import store from "../../../../store/index";
import { handleGraphQLErrors } from "../../../../utils/formatHelpers";
import { msgError, msgSuccess } from "../../../../utils/notifications";
import reduxWrapper from "../../../../utils/reduxWrapper";
import rollbar from "../../../../utils/rollbar";
import translate from "../../../../utils/translations/translate";
import { GenericForm } from "../../components/GenericForm/index";
import { RemediationModal } from "../../components/RemediationModal/index";
import { UpdateVerificationModal } from "../../components/UpdateVerificationModal";
import { IVulnDataType } from "../../components/Vulnerabilities/types";
import { loadProjectData } from "../ProjectContent/actions";
import * as actions from "./actions";
import * as actionTypes from "./actionTypes";
import { renderFormFields } from "./formStructure";
import { HANDLE_ACCEPTATION, VERIFY_FINDING } from "./queries";
import { IAcceptationApprovalAttrs, IHistoricTreatment, IVerifyFindingResult } from "./types";

export interface IDescriptionViewProps {
  dataset: {
    acceptanceDate: string;
    acceptationApproval: string;
    acceptationUser: string;
    actor: string;
    affectedSystems: string;
    analyst: string;
    attackVectorDesc: string;
    btsUrl: string;
    clientCode: string;
    clientProject: string;
    compromisedAttributes: string;
    compromisedRecords: string;
    cweUrl: string;
    description: string;
    historicTreatment: IHistoricTreatment[];
    justification: string;
    newRemediated: boolean;
    openVulnerabilities: string;
    recommendation: string;
    releaseDate: string;
    remediated: boolean;
    requirements: string;
    risk: string;
    scenario: string;
    severity?: string;
    state: string;
    subscription: string;
    tag?: string;
    threat: string;
    title: string;
    treatment: string;
    treatmentManager: string;
    type: string;
    userEmails: Array<{ email: string }>;
    verified: boolean;
  };
  findingId: string;
  formValues: {
    treatment: string;
    treatmentVuln: string;
  };
  isEditing: boolean;
  isRemediationOpen: boolean;
  isRequestingVerification: boolean;
  isTreatmentModal: boolean;
  isVerifyingRequest: boolean;
  projectName: string;
  userRole: string;
  setRequestState(): void;
  setVerifyState(): void;
  verificationFn(vulnerabilities: IVulnDataType[], action: "request" | "verify", clearSelected: () => void): void;
}

let remediationType: string = "request_verification";

const renderRequestVerifiyBtn: ((props: IDescriptionViewProps) => JSX.Element) =
  (props: IDescriptionViewProps): JSX.Element => {
    const handleClick: (() => void) = (): void => {
      props.setRequestState();
    };

    const canRequestVerification: boolean =
      props.dataset.state === "open"
      && _.includes(["CONTINUOUS", "continuous", "Continua", "Concurrente", "Si"], props.dataset.subscription)
      && !props.dataset.newRemediated && !props.isEditing && !props.dataset.remediated;

    return (
      <Button
        bsStyle="success"
        disabled={!canRequestVerification}
        onClick={handleClick}
      >
        <FluidIcon icon="verified" />
        {!props.isRequestingVerification ? translate.t("search_findings.tab_description.request_verify")
        : translate.t("search_findings.tab_description.cancel_verify")}
      </Button>
    );
  };

const renderVerifiyBtnInFinding: ((props: IDescriptionViewProps) => JSX.Element) =
  (props: IDescriptionViewProps): JSX.Element => {
    const handleClick: (() => void) = (): void => {
      remediationType = "verify_request";
      store.dispatch(actions.openRemediationMdl());
    };

    const canVerify: boolean =
      props.dataset.state === "open"
      && _.includes(["CONTINUOUS", "continuous", "Continua", "Concurrente", "Si"], props.dataset.subscription)
      && props.dataset.remediated;

    return (
      <Button
        bsStyle="success"
        hidden={!canVerify}
        onClick={handleClick}
      >
        <FluidIcon icon="verified" /> {translate.t("search_findings.tab_description.mark_verified_finding")}
      </Button>
    );
  };

const renderVerifiyBtn: ((props: IDescriptionViewProps) => JSX.Element) =
  (props: IDescriptionViewProps): JSX.Element => {
    const handleClick: (() => void) = (): void => {
      props.setVerifyState();
    };

    const canVerify: boolean =
      props.dataset.state === "open"
      && _.includes(["CONTINUOUS", "continuous", "Continua", "Concurrente", "Si"], props.dataset.subscription)
      && !props.dataset.verified && !props.isEditing;

    return (
      <Button
        bsStyle="success"
        disabled={!canVerify}
        onClick={handleClick}
      >
        <FluidIcon icon="verified" />
        {!props.isVerifyingRequest ? translate.t("search_findings.tab_description.mark_verified")
        : translate.t("search_findings.tab_description.cancel_verified")}
      </Button>
    );
  };

const renderAcceptationBtns: (() => JSX.Element) = (): JSX.Element => {
  const handleRejectClick: (() => void) = (): void => {
    remediationType = "reject_acceptation";
    store.dispatch(actions.openRemediationMdl());
  };
  const handleApproveClick: (() => void) = (): void => {
    remediationType = "approve_acceptation";
    store.dispatch(actions.openRemediationMdl());
  };

  return (
    <React.Fragment>
      <Button
        hidden={true}
        bsStyle="success"
        onClick={handleApproveClick}
      >
        <FluidIcon icon="verified" />{translate.t("search_findings.acceptation_buttons.approve")}
      </Button>
      <Button
        hidden={true}
        bsStyle="success"
        onClick={handleRejectClick}
      >
        {translate.t("search_findings.acceptation_buttons.reject")}
      </Button>
    </React.Fragment>
  );
};

const updateDescription: ((values: IDescriptionViewProps["dataset"], userRole: string, findingId: string) => void) =
  (values: IDescriptionViewProps["dataset"], userRole: string, findingId: string): void => {
    const thunkDispatch: ThunkDispatch<{}, {}, AnyAction> = (
      store.dispatch as ThunkDispatch<{}, {}, AnyAction>
    );

    if (_.includes(["admin", "analyst"], userRole)) {
      mixpanel.track(
        "UpdateFindingDescript",
        {
          Organization: (window as typeof window & { userOrganization: string }).userOrganization,
          User: (window as typeof window & { userName: string }).userName,
        });
      thunkDispatch(actions.updateDescription(findingId, values));
    } else {
      thunkDispatch(actions.updateClientDescription(findingId, values));
    }
  };

const renderForm: ((props: IDescriptionViewProps) => JSX.Element) = (props: IDescriptionViewProps): JSX.Element => {
  const handleEdit: (() => void) = (): void => { store.dispatch(actions.editDescription()); };

  return (
  <Col md={12} sm={12} xs={12}>
    <ConfirmDialog
      message={translate.t("search_findings.tab_description.approval_message")}
      title={translate.t("search_findings.tab_description.approval_title")}
    >
      {(confirmUndefined: ConfirmFn): React.ReactNode => (
          <GenericForm
            name="editDescription"
            initialValues={props.dataset}
            onSubmit={(values: IDescriptionViewProps["dataset"]): void => {
              if (props.formValues.treatment === "ACCEPTED_UNDEFINED" &&
                props.dataset.treatment !== "ACCEPTED_UNDEFINED") {
                confirmUndefined(() => { updateDescription(values, props.userRole, props.findingId); });
              } else {
                updateDescription(values, props.userRole, props.findingId);
              }
            }}
          >
            {({ pristine }: InjectedFormProps): React.ReactNode => (
              <React.Fragment>
                <ButtonToolbar className="pull-right">
                  {_.includes(["customeradmin"], props.userRole) && props.dataset.acceptationApproval === "SUBMITTED"
                  && props.dataset.treatment === "ACCEPTED_UNDEFINED"
                    ? renderAcceptationBtns() : undefined}
                  {_.includes(["admin", "analyst"], props.userRole) && props.dataset.remediated
                    ? renderVerifiyBtnInFinding(props) : undefined}
                  {_.includes(["admin", "analyst"], props.userRole) && !props.dataset.verified
                    ? renderVerifiyBtn(props) : undefined}
                  {_.includes(["admin", "customer", "customeradmin"], props.userRole)
                    ? renderRequestVerifiyBtn(props) : undefined}
                  {props.isEditing ? (
                    <Button type="submit" disabled={pristine}>
                      <FluidIcon icon="loading" /> {translate.t("search_findings.tab_description.update")}
                    </Button>
                  ) : undefined}
                  <Button
                    bsStyle="primary"
                    disabled={props.isRequestingVerification || props.isVerifyingRequest}
                    onClick={handleEdit}
                  >
                    <FluidIcon icon="edit" /> {translate.t("search_findings.tab_description.editable")}
                  </Button>
                </ButtonToolbar>
                {renderFormFields(props)}
              </React.Fragment>
            )}
          </GenericForm>
      )}
    </ConfirmDialog>
  </Col>
  );
};

const component: ((props: IDescriptionViewProps) => JSX.Element) = (props: IDescriptionViewProps): JSX.Element => {
  const { userEmail } = window as typeof window & Dictionary<string>;

  const onMount: (() => void) = (): (() => void) => {
    mixpanel.track("FindingDescription", {
      Organization: (window as typeof window & { userOrganization: string }).userOrganization,
      User: (window as typeof window & { userName: string }).userName,
    });
    const thunkDispatch: ThunkDispatch<{}, {}, AnyAction> = (
      store.dispatch as ThunkDispatch<{}, {}, AnyAction>
    );

    thunkDispatch(loadProjectData(props.projectName));
    thunkDispatch(actions.loadDescription(props.findingId, props.projectName, props.userRole));

    return (): void => {
      store.dispatch(actions.clearDescription());
    };
  };
  React.useEffect(onMount, []);

  const [isRequestingVerification, setRequestingVerification] = React.useState(false);
  const [isVerifyingRequest, setVerifyingRequest] = React.useState(false);
  const [isRemediationOpen, setRemediationOpen] = React.useState(false);
  const [vulnsRows, setVulnsRows] = React.useState<IVulnDataType[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(() => (): void => undefined);
  const [verificationType, setVerificationType] = React.useState<"request" | "verify">("request");

  const setVerifyState: (() => void) = (): void => { setVerifyingRequest(!isVerifyingRequest); };
  const setRequestState: (() => void) = (): void => { setRequestingVerification(!isRequestingVerification); };
  const closeRemediationModal: (() => void) = (): void => { setRemediationOpen(false); };
  const verificationFn: (
    (vulnerabilities: IVulnDataType[], action: "request" | "verify", clearSelected: () => void) => void) =
    (vulnerabilities: IVulnDataType[], action: "request" | "verify", clearSelected: () => void): void => {
      setVerificationType(action);
      setRemediationOpen(true);
      setVulnsRows(vulnerabilities);
      setClearSelectedRows(() => clearSelected);
  };

  const refetchData: (() => void) = (): void => {
    const thunkDispatch: ThunkDispatch<{}, {}, AnyAction> = (
      store.dispatch as ThunkDispatch<{}, {}, AnyAction>
    );
    thunkDispatch(actions.loadDescription(props.findingId, props.projectName, props.userRole));
  };

  const [verifyFinding, {loading: submittingVerify}] = useMutation(VERIFY_FINDING, {
    onCompleted: (mtResult: IVerifyFindingResult): void => {
      if (mtResult.verifyFinding.success) {
        store.dispatch({
          payload: {
            descriptionData: { remediated: false },
          },
          type: actionTypes.LOAD_DESCRIPTION,
        });
        msgSuccess(
          translate.t("proj_alerts.verified_success"),
          translate.t("proj_alerts.updated_title"),
        );
      }
    },
    onError: (error: ApolloError): void => {
      error.graphQLErrors.forEach(({ message }: GraphQLError): void => {
        if (message === "Exception - Error verification not requested") {
          msgError(translate.t("proj_alerts.no_verification_requested"));
        } else {
          msgError(translate.t("proj_alerts.error_textsad"));
          rollbar.error(error.message, error);
        }
      });
    },
  });

  const handleMtResolveAcceptation: ((mtResult: IAcceptationApprovalAttrs) => void) =
      (mtResult: IAcceptationApprovalAttrs): void => {
      if (!_.isUndefined(mtResult)) {
        if (mtResult.handleAcceptation.success) {
          mixpanel.track(
            "HandleAcceptation",
            {
              Organization: (window as typeof window & { userOrganization: string }).userOrganization,
              User: (window as typeof window & { userName: string }).userName,
            });
          msgSuccess(
            props.dataset.acceptationApproval === "APPROVED" ?
            translate.t("proj_alerts.acceptation_approved") : translate.t("proj_alerts.acceptation_rejected"),
            translate.t("proj_alerts.updated_title"),
          );
        }
      }
    };

  return (
    <React.Fragment>
      <Mutation mutation={HANDLE_ACCEPTATION} onCompleted={handleMtResolveAcceptation}>
        {(handleAcceptation: MutationFunction, mutationRes: MutationResult): JSX.Element => {
          if (!_.isUndefined(mutationRes.error)) {
            handleGraphQLErrors("An error occurred approving acceptation", mutationRes.error);

            return <React.Fragment/>;
          }

          const handleResolveAcceptation: ((observations: string, response: string) => void) =
            (observations: string, response: string): void => {
            handleAcceptation({ variables: { findingId: props.findingId,
                                             observations,
                                             projectName: props.projectName,
                                             response }})
              .catch();
            props.dataset.treatment = response === "REJECTED" ? "NEW" : "ACCEPTED_UNDEFINED";
            props.dataset.acceptationApproval = response;
            props.dataset.acceptationUser = userEmail;
            props.dataset.justification = observations;
          };

          return (
            <React.StrictMode>
              <Row>
                <React.Fragment>
                  <RemediationModal
                    additionalInfo={
                      remediationType === "approve_acceptation" ?
                      `${props.dataset.openVulnerabilities} vulnerabilities will be assumed`
                      : undefined
                    }
                    isLoading={submittingVerify}
                    isOpen={props.isRemediationOpen}
                    message={
                      remediationType === "request_verification" ?
                      translate.t("search_findings.tab_description.remediation_modal.justification")
                      : translate.t("search_findings.tab_description.remediation_modal.observations")
                    }
                    onClose={(): void => { store.dispatch(actions.closeRemediationMdl()); }}
                    onSubmit={(values: { treatmentJustification: string }): void => {
                      if (remediationType === "verify_request") {
                        verifyFinding({
                          variables: {
                            findingId: props.findingId, justification: values.treatmentJustification,
                          },
                        })
                        .catch();
                      } else {
                        const response: string = remediationType === "approve_acceptation" ? "APPROVED" : "REJECTED";
                        handleResolveAcceptation(values.treatmentJustification, response);
                      }
                      store.dispatch(actions.closeRemediationMdl());
                    }}
                    title={
                      remediationType === "request_verification" ?
                      translate.t("search_findings.tab_description.remediation_modal.title_request")
                      : translate.t("search_findings.tab_description.remediation_modal.title_observations")
                    }
                  />
                </React.Fragment>
              </Row>
              { isRemediationOpen ?
                <UpdateVerificationModal
                  findingId={props.findingId}
                  isOpen={isRemediationOpen}
                  remediationType={verificationType}
                  vulns={vulnsRows}
                  handleCloseModal={closeRemediationModal}
                  refetchData={refetchData}
                  clearSelected={clearSelectedRows}
                  setRequestState={setRequestState}
                  setVerifyState={setVerifyState}
                />
                : undefined }
            </React.StrictMode>
          );
        }}
      </Mutation>
      {renderForm(
        {...props, isRequestingVerification, isVerifyingRequest, setRequestState, setVerifyState, verificationFn})}
    </React.Fragment>
  );
};

const fieldSelector: ((state: {}, ...fields: string[]) => string) = formValueSelector("editDescription");
const fieldSelectorVuln: ((state: {}, ...fields: string[]) => string) = formValueSelector("editTreatmentVulnerability");

export const descriptionView: React.ComponentType<IDescriptionViewProps> = reduxWrapper(
  component,
  (state: StateType<Reducer>): IDescriptionViewProps => ({
    ...state.dashboard.description,
    formValues: {
      treatment: fieldSelector(state, "treatment"),
      treatmentVuln: fieldSelectorVuln(state, "treatment"),
    },
    isMdlConfirmOpen: state.dashboard.isMdlConfirmOpen,
    userRole: state.dashboard.user.role,
  }),
);
