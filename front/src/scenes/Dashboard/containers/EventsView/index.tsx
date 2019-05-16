/* tslint:disable:jsx-no-lambda jsx-no-multiline-js no-empty
 * JSX-NO-LAMBDA: Disabling this rule is necessary because it is not possible
 * to call functions with props as params from the JSX element definition
 * without using lambda expressions () => {}
 *
 * NO-MULTILINE-JS: Disabling this rule is necessary for the sake of
  * readability of the code that defines the headers of the table
 */
import mixpanel from "mixpanel-browser";
import React, { ComponentType } from "react";
import { Col, Row } from "react-bootstrap";
import {
  InferableComponentEnhancer,
  lifecycle,
} from "recompose";
import { AnyAction, Reducer } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { StateType } from "typesafe-actions";
import { dataTable as DataTable, IHeader } from "../../../../components/DataTable/index";
import store from "../../../../store/index";
import { formatEvents } from "../../../../utils/formatHelpers";
import reduxWrapper from "../../../../utils/reduxWrapper";
import translate from "../../../../utils/translations/translate";
import * as actions from "./actions";
import { IEventsViewProps } from "./types";

const enhance: InferableComponentEnhancer<{}> =
lifecycle<IEventsViewProps, {}>({
  componentWillUnmount(): void { store.dispatch(actions.clearEventsState()); },
  componentDidMount(): void {
    mixpanel.track(
      "ProjectEvents",
      {
        Organization: (window as Window & { userOrganization: string }).userOrganization,
        User: (window as Window & { userName: string }).userName,
      });

    const { projectName } =  this.props.match.params;
    const thunkDispatch: ThunkDispatch<{}, {}, AnyAction> = (
      store.dispatch as ThunkDispatch<{}, {}, AnyAction>
    );
    thunkDispatch(actions.loadEvents(projectName));
  },
});

const mapStateToProps: ((arg1: StateType<Reducer>) => IEventsViewProps) =
  (state: StateType<Reducer>): IEventsViewProps => ({
    ...state,
    eventsDataset: state.dashboard.events.eventsDataset,
  }
);
const tableHeaders: IHeader[] = [
  {
    align: "center", dataField: "id", header: translate.t("search_findings.tab_events.id"), isDate: false,
    isStatus: false, width: "12%", wrapped: true,
  },
  {
    align: "center", dataField: "eventDate", header: translate.t("search_findings.tab_events.date"), isDate: false,
    isStatus: false, width: "15%", wrapped: true,
  },
  {
    align: "center", dataField: "detail", header: translate.t("search_findings.tab_events.description"), isDate: false,
    isStatus: false, width: "45%", wrapped: true,
  },
  {
    align: "center", dataField: "eventType", header: translate.t("search_findings.tab_events.type"), isDate: false,
    isStatus: false, width: "25%", wrapped: true,
  },
  {
    align: "center", dataField: "eventStatus", header: translate.t("search_findings.tab_events.status"), isDate: false,
    isStatus: true, width: "13%", wrapped: true,
  },
];
export const component: React.FunctionComponent<IEventsViewProps> = (props: IEventsViewProps): JSX.Element => {
  const { projectName } = props.match.params;

  return (
    <React.StrictMode>
      <Row>
        <Col md={12} sm={12}>
          <b>{translate.t("search_findings.tab_events.table_advice")}</b>
          <DataTable
            dataset={formatEvents(props.eventsDataset)}
            enableRowSelection={false}
            exportCsv={true}
            onClickRow={(row: { id: string }): void => {
              window.location.href =
              `/integrates/dashboard#!/project/${projectName}/events/${row.id}/description`;
            }}
            search={true}
            headers={tableHeaders}
            id="tblEvents"
            pageSize={15}
            title=""
          />
        </Col>
      </Row>
    </React.StrictMode>
); };

export const eventsView: ComponentType<IEventsViewProps> = reduxWrapper
(
  enhance(component) as React.FunctionComponent<IEventsViewProps>,
  mapStateToProps,
);
