/* tslint:disable:jsx-no-multiline-js
 *
 * Disabling this rule is necessary for the sake of readability
 */

// Third parties imports
import { QueryResult } from "@apollo/react-common";
import { Query } from "@apollo/react-components";
import _ from "lodash";
import React, { ReactElement } from "react";
import { ButtonToolbar, Col, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router";
// tslint:disable-next-line no-submodule-imports
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/light";
// tslint:disable-next-line no-submodule-imports
import { default as monokaiSublime } from "react-syntax-highlighter/dist/esm/styles/hljs/monokai-sublime";

// Local imports
import { Button } from "../../../../components/Button";
import { statusFormatter } from "../../../../components/DataTableNext/formatters";
import { DataTableNext } from "../../../../components/DataTableNext/index";
import { IHeader } from "../../../../components/DataTableNext/types";
import { Modal } from "../../../../components/Modal";
import { handleGraphQLErrors } from "../../../../utils/formatHelpers";
import translate from "../../../../utils/translations/translate";
import styles from "./index.css";
import { GET_FORCES_EXECUTIONS } from "./queries";

type ForcesViewProps = RouteComponentProps<{ projectName: string }>;

export interface IExploitResult {
  kind: string;
  where: string;
  who: string;
}

export interface IFoundVulnerabilities {
  accepted: number;
  exploitable: number;
  notExploitable: number;
  total: number;
}

export interface IVulnerabilities {
  acceptedExploits: IExploitResult[];
  exploits: IExploitResult[];
  mockedExploits: IExploitResult[];
  numOfVulnerabilitiesInAcceptedExploits: number;
  numOfVulnerabilitiesInExploits: number;
  numOfVulnerabilitiesInMockedExploits: number;
}

export interface IExecution {
  date: string;
  exitCode: string;
  foundVulnerabilities: IFoundVulnerabilities;
  gitRepo: string;
  identifier: string;
  kind: string;
  log: string;
  status: string;
  strictness: string;
  vulnerabilities: IVulnerabilities;
}

const projectForcesView: React.FunctionComponent<ForcesViewProps> = (props: ForcesViewProps): JSX.Element => {

  // States
  const defaultCurrentRow: IExecution = {
    date: "",
    exitCode: "",
    foundVulnerabilities: {
      accepted: 0,
      exploitable: 0,
      notExploitable: 0,
      total: 0,
    },
    gitRepo: "",
    identifier: "",
    kind: "",
    log: "",
    status: "",
    strictness: "",
    vulnerabilities: {
      acceptedExploits: [],
      exploits: [],
      mockedExploits: [],
      numOfVulnerabilitiesInAcceptedExploits: 0,
      numOfVulnerabilitiesInExploits: 0,
      numOfVulnerabilitiesInMockedExploits: 0,
    },
  };
  const [currentRow, updateRow] = React.useState(defaultCurrentRow);
  const [isExecutionDetailsModalOpen, setExecutionDetailsModalOpen] = React.useState(false);

  const onSortState: ((dataField: string, order: SortOrder) => void) = (
    dataField: string, order: SortOrder,
  ): void => {
    const newSorted: Sorted = { dataField, order };
    sessionStorage.setItem("forcesSort", JSON.stringify(newSorted));
  };

  const toTitleCase: ((str: string) => string) = (str: string): string =>
    str.split(" ")
      .map((w: string): string => w[0].toUpperCase() + w.substr(1)
        .toLowerCase())
      .join(" ");

  const getVulnerabilitySummary:
    ((exploitable: number, accepted: number, notExploitable: number, total: number) => string) =
  (exploitable: number, accepted: number, notExploitable: number, total: number): string => {
    const exploitableTrans: string = translate.t("project.forces.found_vulnerabilities.exploitable");
    const acceptedTrans: string = translate.t("project.forces.found_vulnerabilities.accepted");
    const notExploitableTrans: string = translate.t("project.forces.found_vulnerabilities.not_exploitable");
    const totalTrans: string = translate.t("project.forces.found_vulnerabilities.total");

    const exploitableStr: string = `${exploitable} ${exploitableTrans}`;
    const acceptedStr: string = `${accepted} ${acceptedTrans}`;
    const notExploitableStr: string = `${notExploitable} ${notExploitableTrans}`;
    const totalStr: string = `${total} ${totalTrans}`;

    return `${exploitableStr}, ${acceptedStr}, ${notExploitableStr}, ${totalStr}`;
  };

  const getDatasetFromVulnerabilities: ((vulnerabilities: IVulnerabilities) => Dictionary[]) = (
    vulnerabilities: IVulnerabilities,
  ): Dictionary[] => {
    const exploits: Dictionary[] = vulnerabilities.exploits.map((elem: IExploitResult) => ({
      ...elem, riskState: translate.t("project.forces.found_vulnerabilities.exploitable"),
    }));
    const acceptedExploits: Dictionary[] = vulnerabilities.acceptedExploits.map((elem: IExploitResult) => ({
      ...elem, riskState: translate.t("project.forces.found_vulnerabilities.accepted"),
    }));
    const mockedExploits: Dictionary[] = vulnerabilities.mockedExploits.map((elem: IExploitResult) => ({
      ...elem, riskState: translate.t("project.forces.found_vulnerabilities.not_exploitable"),
    }));

    return exploits.concat(acceptedExploits.concat(mockedExploits));
  };

  const formatDate: ((date: string) => string) = (date: string): string => {
    const dateObj: Date = new Date(date);

    const toStringAndPad: ((input: number, positions: number) => string) =
      (input: number, positions: number): string => input.toString()
        .padStart(positions, "0");

    const year: string = toStringAndPad(dateObj.getFullYear(), 4);
    // Warning: months are 0 indexed: January is 0, December is 11
    const month: string = toStringAndPad(dateObj.getMonth() + 1, 2);
    // Warning: Date.getDay() returns the day of the week: Monday is 1, Friday is 5
    const day: string = toStringAndPad(dateObj.getDate(), 2);
    const hours: string = toStringAndPad(dateObj.getHours(), 2);
    const minutes: string = toStringAndPad(dateObj.getMinutes(), 2);

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatText: ((text: string) => ReactElement<Text>) = (text: string): ReactElement<Text> =>
    <text className={styles.wrapped}>{text}</text>;

  const headersExecutionTable: IHeader[] = [
    {
      align: "center", dataField: "date", header: translate.t("project.forces.date"),
      onSort: onSortState, width: "13%", wrapped: true,
    },
    {
      align: "center", dataField: "status", header: translate.t("project.forces.status.title"),
      onSort: onSortState, width: "13%", wrapped: true,
    },
    {
      align: "center", dataField: "foundVulnerabilities.total",
      header: translate.t("project.forces.status.vulnerabilities"),
      onSort: onSortState, width: "6%", wrapped: true,
    },
    {
      align: "center", dataField: "strictness", header: translate.t("project.forces.strictness"),
      onSort: onSortState, width: "5%", wrapped: true,
    },
    {
      align: "center", dataField: "kind", header: translate.t("project.forces.kind.title"),
      onSort: onSortState, width: "13%", wrapped: true,
    },
    {
      align: "center", dataField: "gitRepo", header: translate.t("project.forces.git_repo"),
      onSort: onSortState, width: "13%", wrapped: true,
    },
    {
      align: "center", dataField: "identifier", header: translate.t("project.forces.identifier"),
      onSort: onSortState, width: "13%", wrapped: true,
    },
  ];
  const headersCompromisedToeTable: IHeader[] = [
    {
      dataField: "riskState",
      formatter: formatText,
      header: translate.t("project.forces.compromised_toe.risk_state"),
      width: "15%",
      wrapped: true,
    },
    {
      dataField: "kind",
      formatter: formatText,
      header: translate.t("project.forces.compromised_toe.type"),
      width: "10%",
      wrapped: true,
    },
    {
      dataField: "who",
      formatter: formatText,
      header: translate.t("project.forces.compromised_toe.who"),
      wrapped: true,
    },
    {
      dataField: "where",
      formatter: formatText,
      header: translate.t("project.forces.compromised_toe.where"),
      wrapped: true,
    },
  ];
  const { projectName } = props.match.params;

  const openSeeExecutionDetailsModal: ((event: object, row: IExecution) => void) = (
    _0: object, row: IExecution,
  ): void => {
    updateRow(row);
    setExecutionDetailsModalOpen(true);
  };

  const closeSeeExecutionDetailsModal: (() => void) = (): void => {
    setExecutionDetailsModalOpen(false);
  };

  return (
    <Query
      query={GET_FORCES_EXECUTIONS}
      variables={{ projectName }}
    >
      {
        ({ data, error }: QueryResult): JSX.Element => {
          if (_.isUndefined(data) || _.isEmpty(data)) {
            return <React.Fragment />;
          }
          if (!_.isUndefined(error)) {
            handleGraphQLErrors("An error occurred getting executions", error);

            return <React.Fragment />;
          }
          if (!_.isUndefined(data)) {
            const executions: IExecution[] = data.forcesExecutions.executions.map((execution: IExecution) => {
              const date: string = formatDate(execution.date);
              const kind: string = toTitleCase(translate.t(
                execution.kind === "static" ? "project.forces.kind.static" : "project.forces.kind.dynamic"));
              const strictness: string = toTitleCase(execution.strictness);
              const foundVulnerabilities: IFoundVulnerabilities = {
                accepted: execution.vulnerabilities.numOfVulnerabilitiesInAcceptedExploits,
                exploitable: execution.vulnerabilities.numOfVulnerabilitiesInExploits,
                notExploitable: execution.vulnerabilities.numOfVulnerabilitiesInMockedExploits,
                total: execution.vulnerabilities.numOfVulnerabilitiesInExploits
                  + execution.vulnerabilities.numOfVulnerabilitiesInMockedExploits
                  + execution.vulnerabilities.numOfVulnerabilitiesInAcceptedExploits,
              };
              const status: ReactElement = statusFormatter(translate.t(
                foundVulnerabilities.total === 0
                  ? "project.forces.status.secure"
                  : "project.forces.status.vulnerable"));

              return { ...execution, date, foundVulnerabilities, kind, status, strictness };
            });

            const initialSort: string = JSON.stringify({ dataField: "date", order: "desc" });

            return (
              <React.StrictMode>
                <p>{translate.t("project.forces.table_advice")}</p>
                <DataTableNext
                  bordered={true}
                  dataset={executions}
                  defaultSorted={JSON.parse(_.get(sessionStorage, "forcesSort", initialSort))}
                  exportCsv={true}
                  search={true}
                  headers={headersExecutionTable}
                  id="tblForcesExecutions"
                  pageSize={100}
                  remote={false}
                  rowEvents={{ onClick: openSeeExecutionDetailsModal }}
                  title=""
                />
              <Modal
                  bsSize="large"
                  footer={<div />}
                  headerTitle={translate.t("project.forces.execution_details_modal.title")}
                  open={isExecutionDetailsModalOpen}
                  onClose={closeSeeExecutionDetailsModal}
              >
                <div>
                  <Row>
                    <Col md={4}><p><b>{translate.t("project.forces.date")}</b></p></Col>
                    <Col md={8}><p>{currentRow.date}</p></Col>
                  </Row>
                  <Row>
                    <Col md={4}><p><b>{translate.t("project.forces.status.title")}</b></p></Col>
                    <Col md={8}><p>{currentRow.status}</p></Col>
                  </Row>
                  <Row>
                    <Col md={4}><p><b>{translate.t("project.forces.strictness")}</b></p></Col>
                    <Col md={8}><p>{currentRow.strictness}</p></Col>
                  </Row>
                  <Row>
                    <Col md={4}><p><b>{translate.t("project.forces.kind.title")}</b></p></Col>
                    <Col md={8}><p>{currentRow.kind}</p></Col>
                  </Row>
                  <Row>
                    <Col md={4}><p><b>{translate.t("project.forces.git_repo")}</b></p></Col>
                    <Col md={8}><p>{currentRow.gitRepo}</p></Col>
                  </Row>
                  <Row>
                    <Col md={4}><p><b>{translate.t("project.forces.identifier")}</b></p></Col>
                    <Col md={8}><p>{currentRow.identifier}</p></Col>
                  </Row>
                  <Row>
                    <Col md={4}><p><b>{translate.t("project.forces.found_vulnerabilities.title")}</b></p></Col>
                    <Col md={8}>
                      <text className={styles.wrapped}>
                        {getVulnerabilitySummary(
                          currentRow.foundVulnerabilities.exploitable,
                          currentRow.foundVulnerabilities.accepted,
                          currentRow.foundVulnerabilities.notExploitable,
                          currentRow.foundVulnerabilities.total)}
                      </text>
                    </Col>
                  </Row>
                  <br />
                  <DataTableNext
                    bordered={true}
                    dataset={getDatasetFromVulnerabilities(currentRow.vulnerabilities)}
                    exportCsv={false}
                    search={false}
                    headers={headersCompromisedToeTable}
                    id="tblCompromisedToe"
                    pageSize={100}
                    remote={false}
                  />
                  <hr />
                  <SyntaxHighlighter style={monokaiSublime} language="yaml" wrapLines={true}>
                    {currentRow.log}
                  </SyntaxHighlighter>
                  <ButtonToolbar className="pull-right">
                    <Button bsStyle="success" onClick={closeSeeExecutionDetailsModal}>
                      {translate.t("project.forces.execution_details_modal.close")}
                    </Button>
                  </ButtonToolbar>
                </div>
              </Modal>
              </React.StrictMode>
            );
          } else {
            return <React.Fragment />;
          }
        }}
    </Query>
  );
};

export { projectForcesView as ProjectForcesView };
