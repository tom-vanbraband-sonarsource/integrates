import _ from "lodash";
import mixpanel from "mixpanel-browser";
import React from "react";
import { Col, ControlLabel, FormGroup, Row } from "react-bootstrap";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { NavLink, Route, Switch } from "react-router-dom";
import { InferableComponentEnhancer, lifecycle } from "recompose";
import { Field, submit } from "redux-form";
import ConfirmDialog from "../../../../components/ConfirmDialog/index";
import { dropdownField } from "../../../../utils/forms/fields";
import translate from "../../../../utils/translations/translate";
import { required } from "../../../../utils/validations";
import { FindingHeader } from "../../components/FindingHeader";
import { GenericForm } from "../../components/GenericForm";
import { IDashboardState } from "../../reducer";
import { commentsView as CommentsView } from "../CommentsView/index";
import { descriptionView as DescriptionView } from "../DescriptionView/index";
import { evidenceView as EvidenceView } from "../EvidenceView/index";
import { exploitView as ExploitView } from "../ExploitView/index";
import { recordsView as RecordsView } from "../RecordsView/index";
import { severityView as SeverityView } from "../SeverityView/index";
import { trackingView as TrackingView } from "../TrackingView/index";
import {
  approveDraft, clearFindingState, deleteFinding, loadFindingData, rejectDraft, ThunkDispatcher,
} from "./actions";
import style from "./index.css";

// tslint:disable-next-line:no-any Allows to render containers without specifying values for their redux-supplied props
const reduxProps: any = {};

interface IFindingContentBaseProps {
  // Route props
  match: {
    params: { [key: string]: string };
  };
}

interface IFindingContentStateProps {
  header: {
    openVulns: number;
    reportDate: string;
    severity: number;
    status: "Abierto" | "Cerrado" | "Default";
  };
  title: string;
}

interface IFindingContentDispatchProps {
  onApprove(): void;
  onConfirmDelete(): void;
  onDelete(justification: string): void;
  onLoad(): void;
  onReject(): void;
  onUnmount(): void;
}

type IFindingContentProps = IFindingContentBaseProps & (IFindingContentStateProps & IFindingContentDispatchProps);

const enhance: InferableComponentEnhancer<{}> = lifecycle<IFindingContentProps, {}>({
  componentDidMount(): void { this.props.onLoad(); },
  componentWillUnmount(): void { this.props.onUnmount(); },
});

const findingContent: React.SFC<IFindingContentProps> = (props: IFindingContentProps): JSX.Element => {
  const { findingId, projectName } = props.match.params;
  const userRole: string = (window as Window & { userRole: string }).userRole;

  const renderDescription: (() => JSX.Element) = (): JSX.Element => {
    mixpanel.track("FindingDescription");

    return <DescriptionView findingId={findingId} projectName={projectName} userRole={userRole} {...reduxProps} />;
  };
  const renderSeverity: (() => JSX.Element) = (): JSX.Element => {
    mixpanel.track("FindingSeverity");

    return <SeverityView findingId={findingId} canEdit={_.includes(["admin", "analyst"], userRole)} {...reduxProps} />;
  };
  const renderEvidence: (() => JSX.Element) = (): JSX.Element => {
    mixpanel.track("FindingEvidence");

    return <EvidenceView findingId={findingId} canEdit={_.includes(["admin", "analyst"], userRole)} {...reduxProps} />;
  };
  const renderExploit: (() => JSX.Element) = (): JSX.Element => {
    mixpanel.track("FindingExploit");

    return <ExploitView findingId={findingId} canEdit={_.includes(["admin", "analyst"], userRole)} {...reduxProps} />;
  };
  const renderTracking: (() => JSX.Element) = (): JSX.Element => {
    mixpanel.track("FindingTracking");

    return <TrackingView findingId={findingId} hasNewVulnerabilities={true} userRole={userRole} {...reduxProps} />;
  };
  const renderRecords: (() => JSX.Element) = (): JSX.Element => {
    mixpanel.track("FindingRecords");

    return <RecordsView findingId={findingId} canEdit={_.includes(["admin", "analyst"], userRole)} {...reduxProps} />;
  };
  const renderComments: (() => JSX.Element) = (): JSX.Element => {
    mixpanel.track("FindingComments");

    return <CommentsView type="comment" findingId={findingId} />;
  };
  const renderObservations: (() => JSX.Element) = (): JSX.Element => {
    mixpanel.track("FindingObservations");

    return <CommentsView type="observation" findingId={findingId} />;
  };

  const handleReject: (() => void) = (): void => { props.onReject(); };
  const handleConfirmDelete: (() => void) = (): void => { props.onConfirmDelete(); };
  const handleDelete: ((values: { justification: string }) => void) = (values: { justification: string }): void => {
    props.onDelete(values.justification);
  };

  return (
    <React.StrictMode>
      <div className={style.mainContainer}>
        <Row>
          <Col md={12} sm={12}>
            <React.Fragment>
              <hr />
              <div className={style.stickyContainer}>
                <FindingHeader {...props.header} />
                <ul className={style.tabsContainer}>
                  <li id="infoItem" className={style.tab}>
                    <NavLink activeClassName={style.active} to={`/project/${projectName}/${findingId}/description`}>
                      <i className="icon s7-note2" />
                      &nbsp;{translate.t("search_findings.tab_description.tab_title")}
                    </NavLink>
                  </li>
                  <li id="cssv2Item" className={style.tab}>
                    <NavLink activeClassName={style.active} to={`/project/${projectName}/${findingId}/severity`}>
                      <i className="icon s7-calculator" />
                      &nbsp;{translate.t("search_findings.tab_severity.tab_title")}
                    </NavLink>
                  </li>
                  <li id="evidenceItem" className={style.tab}>
                    <NavLink activeClassName={style.active} to={`/project/${projectName}/${findingId}/evidence`}>
                      <i className="icon s7-photo" />
                      &nbsp;{translate.t("search_findings.tab_evidence.tab_title")}
                    </NavLink>
                  </li>
                  <li id="exploitItem" className={style.tab}>
                    <NavLink activeClassName={style.active} to={`/project/${projectName}/${findingId}/exploit`}>
                      <i className="icon s7-file" />
                      &nbsp;{translate.t("search_findings.tab_exploit.tab_title")}
                    </NavLink>
                  </li>
                  <li id="trackingItem" className={style.tab}>
                    <NavLink activeClassName={style.active} to={`/project/${projectName}/${findingId}/tracking`}>
                      <i className="icon s7-graph1" />
                      &nbsp;{translate.t("search_findings.tab_tracking.tab_title")}
                    </NavLink>
                  </li>
                  <li id="recordsItem" className={style.tab}>
                    <NavLink activeClassName={style.active} to={`/project/${projectName}/${findingId}/records`}>
                      <i className="icon s7-notebook" />
                      &nbsp;{translate.t("search_findings.tab_records.tab_title")}
                    </NavLink>
                  </li>
                  <li id="commentItem" className={style.tab}>
                    <NavLink activeClassName={style.active} to={`/project/${projectName}/${findingId}/comments`}>
                      <i className="icon s7-comment" />
                      &nbsp;{translate.t("search_findings.tab_comments.tab_title")}
                    </NavLink>
                  </li>
                  {/*tslint:disable-next-line:jsx-no-multiline-js Necessary for allowing conditional rendering here*/}
                  {_.includes(["admin", "analyst"], userRole) ?
                    <li id="observationsItem" className={style.tab}>
                      <NavLink activeClassName={style.active} to={`/project/${projectName}/${findingId}/observations`}>
                        <i className="icon s7-note" />
                        &nbsp;{translate.t("search_findings.tab_observations.tab_title")}
                      </NavLink>
                    </li>
                    : undefined}
                </ul>
              </div>

              <div className={style.tabContent}>
                <Switch>
                  <Route path="/project/:projectName/:findingId(\d+)/description" render={renderDescription} />
                  <Route path="/project/:projectName/:findingId(\d+)/severity" render={renderSeverity} />
                  <Route path="/project/:projectName/:findingId(\d+)/evidence" render={renderEvidence} />
                  <Route path="/project/:projectName/:findingId(\d+)/exploit" render={renderExploit} />
                  <Route path="/project/:projectName/:findingId(\d+)/tracking" render={renderTracking} />
                  <Route path="/project/:projectName/:findingId(\d+)/records" render={renderRecords} />
                  <Route path="/project/:projectName/:findingId(\d+)/comments" render={renderComments} />
                  <Route path="/project/:projectName/:findingId(\d+)/observations" render={renderObservations} />
                </Switch>
              </div>
            </React.Fragment>
          </Col>
        </Row>
      </div>
      <ConfirmDialog
        name="confirmDeleteFinding"
        onProceed={handleConfirmDelete}
        title={translate.t("search_findings.delete.title")}
      >
        <GenericForm name="deleteFinding" onSubmit={handleDelete}>
          <FormGroup>
            <ControlLabel>{translate.t("search_findings.delete.justif.label")}</ControlLabel>
            <Field name="justification" component={dropdownField} validate={[required]}>
              <option value="" />
              <option value="Change of evidence">{translate.t("search_findings.delete.justif.evidence_change")}</option>
              <option value="Finding has changed">{translate.t("search_findings.delete.justif.finding_change")}</option>
              <option value="It is not a Vulnerability">{translate.t("search_findings.delete.justif.not_vuln")}</option>
              <option value="It is duplicated">{translate.t("search_findings.delete.justif.duplicated")}</option>
            </Field>
          </FormGroup>
        </GenericForm>
      </ConfirmDialog>
      <ConfirmDialog name="confirmRejectDraft" onProceed={handleReject} title={translate.t("search_findings.reject")} />
    </React.StrictMode>
  );
};

interface IState { dashboard: IDashboardState; }
const mapStateToProps: MapStateToProps<IFindingContentStateProps, IFindingContentBaseProps, IState> =
  (state: IState): IFindingContentStateProps => ({
    header: {
      openVulns: state.dashboard.finding.openVulns,
      reportDate: state.dashboard.finding.reportDate,
      severity: state.dashboard.severity.criticity,
      status: state.dashboard.finding.status,
    },
    title: state.dashboard.finding.title,
  });

const mapDispatchToProps: MapDispatchToProps<IFindingContentDispatchProps, IFindingContentBaseProps> =
  (dispatch: ThunkDispatcher, ownProps: IFindingContentBaseProps): IFindingContentDispatchProps => {
    const { findingId, projectName } = ownProps.match.params;

    return ({
      onApprove: (): void => { dispatch(approveDraft(findingId)); },
      onConfirmDelete: (): void => { dispatch(submit("deleteFinding")); },
      onDelete: (justification: string): void => { dispatch(deleteFinding(findingId, projectName, justification)); },
      onLoad: (): void => { dispatch(loadFindingData(findingId)); },
      onReject: (): void => { dispatch(rejectDraft(findingId, projectName)); },
      onUnmount: (): void => { dispatch(clearFindingState()); },
    });
  };

export = connect(mapStateToProps, mapDispatchToProps)(enhance(findingContent));
