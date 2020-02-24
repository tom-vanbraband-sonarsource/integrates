/* tslint:disable:jsx-no-multiline-js
 * NO-MULTILINE-JS: Disabling this rule is necessary for the sake of readability of the code
 */
import { useMutation } from "@apollo/react-hooks";
import _ from "lodash";
import React from "react";
import { DataTableNext } from "../../../../components/DataTableNext";
import { changeVulnStateFormatter } from "../../../../components/DataTableNext/formatters";
import { IHeader } from "../../../../components/DataTableNext/types";
import { msgSuccess } from "../../../../utils/notifications";
import translate from "../../../../utils/translations/translate";
import { remediationModal as RemediationModal } from "../RemediationModal/index";
import { default as style } from "./index.css";
import { REQUEST_VERIFICATION_VULN, VERIFY_VULNERABILITIES } from "./queries";
import { IRequestVerificationVulnResult, IVerifyRequestVulnResult } from "./types";

interface IVulnData {
  currentState: string;
  id: string;
  where: string;
}
export interface IUpdateVerificationModal {
  findingId: string;
  isOpen: boolean;
  remediationType: "request" | "verify";
  userRole: string;
  vulns: IVulnData[];
  handleCloseModal(): void;
}

const updateVerificationModal: React.FC<IUpdateVerificationModal> = (props: IUpdateVerificationModal): JSX.Element => {
  const [vulnerabilitiesList, setVulnerabilities] = React.useState(props.vulns);
  const closeRemediationModal: (() => void) = (): void => { props.handleCloseModal(); };

  const [requestVerification, {loading: submittingRequest}] = useMutation(REQUEST_VERIFICATION_VULN, {
    onCompleted: (data: IRequestVerificationVulnResult): void => {
      if (data.requestVerificationVuln.success) {
        msgSuccess(
          translate.t("proj_alerts.verified_success"),
          translate.t("proj_alerts.updated_title"),
        );
      }
    },
  });
  const [verifyRequest, {loading: submittingVerify}] = useMutation(VERIFY_VULNERABILITIES, {
    onCompleted: (data: IVerifyRequestVulnResult): void => {
      if (data.verifyRequestVuln.success) {
        msgSuccess(
          translate.t("proj_alerts.verified_success"),
          translate.t("proj_alerts.updated_title"),
        );
      }
    },
  });
  const handleSubmit: ((values: { treatmentJustification: string }) => void) =
    (values: { treatmentJustification: string }): void => {
      if (props.remediationType === "request") {
        const vulnerabilitiesId: string[] = props.vulns.map((vuln: IVulnData) => vuln.id);
        requestVerification({ variables: {
          findingId: props.findingId, justification: values.treatmentJustification,
          vulnerabilities: vulnerabilitiesId }})
          .catch();
      } else {
        const openVulnsId: string[] = vulnerabilitiesList.reduce(
          (acc: string[], vuln: IVulnData) => (vuln.currentState === "open" ? [...acc, vuln.id] : acc), []);
        const closedVulnsId: string[] = vulnerabilitiesList.reduce(
          (acc: string[], vuln: IVulnData) => (vuln.currentState === "closed" ? [...acc, vuln.id] : acc), []);
        verifyRequest({ variables: {
          closedVulns: closedVulnsId, findingId: props.findingId, justification: values.treatmentJustification,
          openVulns: openVulnsId }})
          .catch();
      }
      closeRemediationModal();
    };
  const renderVulnsToVerify: (() => JSX.Element) = (): JSX.Element => {
    const handleUpdateRepo: ((vulnInfo: { [key: string]: string }) => void) =
    (vulnInfo: { [key: string]: string }): void => {
      const newVulnList: IVulnData[] = vulnerabilitiesList.map(
        (vuln: IVulnData) => vuln.id !== vulnInfo.id ? vuln :
        {...vuln, currentState: vuln.currentState === "open" ? "closed" : "open" });
      setVulnerabilities([...newVulnList]);
    };
    const vulnsHeader: IHeader[] = [
      { align: "left", dataField: "where", header: "Where", width: "70%",
        wrapped: true },
      { align: "left", changeFunction: handleUpdateRepo, dataField: "currentState", formatter: changeVulnStateFormatter,
        header: "State", width: "30%", wrapped: true }];
    const remote: RemoteProps = { cellEdit: false, filter: false, pagination: false, sort: false };

    return (
      <DataTableNext
        id="vulnstoverify"
        bordered={false}
        dataset={props.vulns}
        exportCsv={false}
        headers={vulnsHeader}
        onClickRow={undefined}
        pageSize={10}
        remote={remote}
        search={false}
        title=""
        tableBody={style.tableBody}
        tableHeader={style.tableHeader}
      />
    );
  };

  return(
    <React.StrictMode>
      <RemediationModal
        additionalInfo={
          props.remediationType === "request" ?
          translate.t("search_findings.tab_description.remediation_modal.message", { vulns: props.vulns.length })
          : undefined
        }
        isLoading={submittingRequest || submittingVerify}
        isOpen={props.isOpen}
        message={
          props.remediationType === "request" ?
          translate.t("search_findings.tab_description.remediation_modal.justification")
          : translate.t("search_findings.tab_description.remediation_modal.observations")
        }
        onClose={closeRemediationModal}
        onSubmit={handleSubmit}
        title={
          props.remediationType === "request" ?
          translate.t("search_findings.tab_description.remediation_modal.title_request")
          : translate.t("search_findings.tab_description.remediation_modal.title_observations")
        }
      >
        {props.remediationType === "verify" ? renderVulnsToVerify : undefined}
      </RemediationModal>
    </React.StrictMode>
  );
};
export { updateVerificationModal as UpdateVerificationModal };