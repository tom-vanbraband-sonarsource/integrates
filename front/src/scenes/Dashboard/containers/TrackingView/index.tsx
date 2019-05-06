/* tslint:disable jsx-no-multiline-js
 * Disabling this rule is necessary for the sake of readability
 * of the code that renders the timeline items
 */
import _ from "lodash";
import React, { ComponentType } from "react";
import { Col, Row } from "react-bootstrap";
import TextareaAutosize from "react-textarea-autosize";
import {
  InferableComponentEnhancer,
  lifecycle,
} from "recompose";
import { AnyAction, Reducer } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { StateType } from "typesafe-actions";
import store from "../../../../store/index";
import reduxWrapper from "../../../../utils/reduxWrapper";
import translate from "../../../../utils/translations/translate";
import { vulnsView as VulnerabilitiesView } from "../../components/Vulnerabilities/index";
import * as actions from "./actions";
import style from "./index.css";

export interface ITrackingViewProps {
  closedFindingsContent?: string;
  closings: closing[];
  findingId: string;
  hasNewVulnerabilities: boolean;
  openFindingsContent?: string;
  userRole: string;
}

interface IClosing {
  closed: number;
  cycle: number;
  date: string;
  effectiveness: number;
  open: number;
}

export declare type closing = IClosing;

const mapStateToProps: ((arg1: StateType<Reducer>) => ITrackingViewProps) =
  (state: StateType<Reducer>): ITrackingViewProps =>
  ({
    ...state,
    closings: state.dashboard.tracking.closings,
  });

const enhance: InferableComponentEnhancer<{}> =
lifecycle({
  componentDidMount(): void {
    const { findingId } = this.props as ITrackingViewProps;
    const thunkDispatch: ThunkDispatch<{}, {}, AnyAction> = (
      store.dispatch as ThunkDispatch<{}, {}, AnyAction>
    );

    thunkDispatch(actions.loadTracking(findingId));
  },
});

export const trackingViewComponent: React.FunctionComponent<ITrackingViewProps> =
  (props: ITrackingViewProps): JSX.Element => (
    <React.StrictMode>
      <Row>
        { props.hasNewVulnerabilities
          ? <React.Fragment>
            <Row>
                <Col
                  md={12}
                >
                  <Row>
                    <Col
                      md={2}
                      className={style.text_right}
                    >
                      <label className={style.track_title}>{translate.t("search_findings.tab_tracking.open")}</label>
                    </Col>
                    <Col
                      md={10}
                    >
                      <VulnerabilitiesView
                        dataInputs={[]}
                        dataLines={[]}
                        dataPorts={[]}
                        editMode={false}
                        findingId={props.findingId}
                        state={"open"}
                        releaseDate={""}
                        userRole={props.userRole}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col
                      md={2}
                      className={style.text_right}
                    >
                      <label className={style.track_title}>{translate.t("search_findings.tab_tracking.closed")}</label>
                    </Col>
                    <Col
                      md={10}
                    >
                      <VulnerabilitiesView
                        dataInputs={[]}
                        dataLines={[]}
                        dataPorts={[]}
                        editMode={false}
                        findingId={props.findingId}
                        state={"closed"}
                        releaseDate={""}
                        userRole={props.userRole}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              { props.closings.length > 0
                ? <Row>
                  <Col
                    mdOffset={3}
                    md={9}
                    sm={12}
                  >
                    <ul className={style.timelineContainer}>
                      <li
                        key={0}
                        className={`${style.timelineItem} ${props.closings[0].effectiveness === 100 ?
                          style.timelineItemGreen : style.timelineItemRed}`}
                      >
                        <div className={style.timelineDate}>
                          <span>
                            {props.closings[0].date}
                          </span>
                        </div>
                        <div className={style.timelineContent}>
                            <p>
                              {translate.t("search_findings.tab_tracking.founded")},
                                {translate.t("search_findings.tab_tracking.open")}: {props.closings[0].open},
                                {translate.t("search_findings.tab_tracking.closed")}: {props.closings[0].closed}
                             </p>
                        </div>
                      </li>
                      {props.closings
                        .filter((_0: { closed: number; cycle: number; effectiveness: number; open: number },
                                 index: number) => index > 0)
                        .map((item: closing) =>
                        <li
                          key={item.cycle}
                          className={`${style.timelineItem} ${item.effectiveness === 100 ?
                            style.timelineItemGreen : style.timelineItemRed}`}
                        >
                          <div className={style.timelineDate}>
                            <span>
                              {item.date}
                            </span>
                          </div>
                          <div className={style.timelineContent}>
                              <p>
                                {translate.t("search_findings.tab_tracking.cycle")}: {item.cycle},
                                 {translate.t("search_findings.tab_tracking.open")}: {item.open},
                                 {translate.t("search_findings.tab_tracking.closed")}: {item.closed},
                                 {translate.t("search_findings.tab_tracking.effectiveness")}: {item.effectiveness}%
                              </p>
                          </div>
                        </li>,
                      )}
                    </ul>
                  </Col>
                  </Row>
              : undefined
            }
          </React.Fragment>
          : undefined
        }
        {!props.hasNewVulnerabilities && !_.isNil(props.hasNewVulnerabilities)
          ? <React.Fragment>
              <Col
                md={12}
              >
                <p>{translate.t("search_findings.tab_tracking.open")}</p>
                <TextareaAutosize
                  className={style.findingsBox}
                  disabled={true}
                  value={props.openFindingsContent}
                />
              </Col>

                <Col
                  md={12}
                >
                  <p>{translate.t("search_findings.tab_tracking.closed")}</p>
                  <TextareaAutosize
                    className={style.findingsBox}
                    disabled={true}
                    value={props.closedFindingsContent}
                  />
                </Col>
            </React.Fragment>
          : undefined
        }
      </Row>
    </React.StrictMode>
);

trackingViewComponent.defaultProps = {
  closings: [],
};

export const trackingView: ComponentType<ITrackingViewProps> = reduxWrapper
(
  enhance(trackingViewComponent) as React.FunctionComponent<ITrackingViewProps>,
  mapStateToProps,
);
