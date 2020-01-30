/* tslint:disable:jsx-no-multiline-js
 * Disabling this rule is necessary for accessing render props from apollo components
 */
import _ from "lodash";
import mixpanel from "mixpanel-browser";
import React from "react";
import { Mutation, MutationFn, MutationResult, Query, QueryResult } from "react-apollo";
import { ButtonToolbar, Col, ControlLabel, FormGroup, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router";
import { Field, InjectedFormProps } from "redux-form";
import { Button } from "../../../../components/Button";
import { FluidIcon } from "../../../../components/FluidIcon";
import { Modal } from "../../../../components/Modal";
import { dateTimeField, textField } from "../../../../utils/forms/fields";
import translate from "../../../../utils/translations/translate";
import { dateTimeBeforeToday, numeric, required, validDatetime } from "../../../../utils/validations";
import { EditableField } from "../../components/EditableField";
import { GenericForm } from "../../components/GenericForm";
import { GET_EVENT_HEADER } from "../EventContent/queries";
import { GET_EVENT_DESCRIPTION, SOLVE_EVENT_MUTATION, UPDATE_DESCRIPTION_MUTATION } from "./queries";

type EventDescriptionProps = RouteComponentProps<{ eventId: string }>;

const eventDescriptionView: React.FC<EventDescriptionProps> = (props: EventDescriptionProps): JSX.Element => {
  const { eventId } = props.match.params;
  const { userName, userOrganization, userRole } = (window as typeof window & {
    userName: string; userOrganization: string; userRole: string;
  });

  const canEdit: boolean = false;
  const [isEditing, setEditing] = React.useState(false);
  const handleEditClick: (() => void) = (): void => { setEditing(!isEditing); };

  const [isSolvingModalOpen, setSolvingModalOpen] = React.useState(false);
  const openSolvingModal: (() => void) = (): void => {
    setSolvingModalOpen(true);
  };
  const closeSolvingModal: (() => void) = (): void => {
    setSolvingModalOpen(false);
  };

  const onMount: (() => void) = (): void => {
    mixpanel.track("EventDescription", { Organization: userOrganization, User: userName });
  };
  React.useEffect(onMount, []);

  return (
    <React.StrictMode>
      <Query query={GET_EVENT_DESCRIPTION} variables={{ eventId }}>
        {({ data, refetch }: QueryResult): JSX.Element => {
          if (_.isUndefined(data) || _.isEmpty(data)) { return <React.Fragment />; }

          const handleUpdateResult: (() => void) = (): void => {
            refetch()
              .catch();
          };

          const canSolve: boolean = _.includes(["admin", "analyst"], userRole) && data.event.eventStatus !== "SOLVED";

          return (
            <React.Fragment>
              <Modal
                footer={<div />}
                headerTitle={translate.t("search_findings.tab_severity.solve")}
                open={isSolvingModalOpen}
              >
                <Mutation
                  mutation={SOLVE_EVENT_MUTATION}
                  onCompleted={handleUpdateResult}
                  refetchQueries={[{ query: GET_EVENT_HEADER, variables: { eventId } }]}
                >
                  {(solveEvent: MutationFn, { loading: submitting }: MutationResult): React.ReactNode => {
                    const handleSubmit: ((values: {}) => void) = (values: {}): void => {
                      solveEvent({ variables: { eventId, ...values } })
                        .catch();
                      closeSolvingModal();
                    };

                    return (
                      <GenericForm name="solveEvent" onSubmit={handleSubmit}>
                        {({ pristine }: InjectedFormProps): React.ReactNode => (
                          <React.Fragment>
                            <Row>
                              <Col md={6}>
                                <FormGroup>
                                  <ControlLabel>{translate.t("project.events.description.solved.date")}</ControlLabel>
                                  <Field
                                    component={dateTimeField}
                                    name="date"
                                    validate={[required, validDatetime, dateTimeBeforeToday]}
                                  />
                                </FormGroup>
                              </Col>
                              <Col md={6}>
                                <FormGroup>
                                  <ControlLabel>
                                    {translate.t("project.events.description.solved.affectation")}
                                  </ControlLabel>
                                  <Field
                                    component={textField}
                                    name="affectation"
                                    type="number"
                                    validate={[required, numeric]}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                            <ButtonToolbar className="pull-right">
                              <Button bsStyle="success" onClick={closeSolvingModal}>
                                {translate.t("confirmmodal.cancel")}
                              </Button>
                              <Button bsStyle="success" type="submit" disabled={pristine || submitting}>
                                {translate.t("confirmmodal.proceed")}
                              </Button>
                            </ButtonToolbar>
                          </React.Fragment>
                        )}
                      </GenericForm>
                    );
                  }}
                </Mutation>
              </Modal>
              <Mutation mutation={UPDATE_DESCRIPTION_MUTATION} onCompleted={handleUpdateResult}>
                {(updateDescription: MutationFn, { loading: submitting }: MutationResult): React.ReactNode => {
                  const handleSubmit: ((values: { [key: string]: string }) => void) = (
                    values: { [key: string]: string },
                  ): void => {
                    updateDescription({ variables: { eventId, ...values } })
                      .catch();
                    setEditing(false);
                  };

                  return (
                    <GenericForm name="editEvent" initialValues={data.event} onSubmit={handleSubmit}>
                      {({ pristine }: InjectedFormProps): React.ReactNode => (
                        <React.Fragment>
                          <Row>
                            <ButtonToolbar className="pull-right">
                              {canSolve ? (
                                <Button onClick={openSolvingModal}>
                                  <FluidIcon icon="verified" />&nbsp;{translate.t("search_findings.tab_severity.solve")}
                                </Button>
                              ) : undefined}
                              {isEditing ? (
                                <Button disabled={pristine || submitting} type="submit">
                                  <FluidIcon icon="loading" />&nbsp;{translate.t("search_findings.tab_severity.update")}
                                </Button>
                              ) : undefined}
                              {canEdit ? (
                                <Button onClick={handleEditClick}>
                                  <FluidIcon icon="edit" />&nbsp;{translate.t("search_findings.tab_severity.editable")}
                                </Button>
                              ) : undefined}
                            </ButtonToolbar>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <EditableField
                                alignField="horizontalWide"
                                component={textField}
                                currentValue={data.event.detail}
                                label={translate.t("search_findings.tab_events.description")}
                                name="detail"
                                renderAsEditable={false}
                                type="text"
                              />
                            </Col>
                            <Col md={6}>
                              <EditableField
                                alignField="horizontalWide"
                                component={textField}
                                currentValue={data.event.client}
                                label={translate.t("search_findings.tab_events.client")}
                                name="client"
                                renderAsEditable={false}
                                type="text"
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <EditableField
                                alignField="horizontalWide"
                                component={textField}
                                currentValue={data.event.analyst}
                                label={translate.t("search_findings.tab_events.analyst")}
                                name="analyst"
                                renderAsEditable={false}
                                type="text"
                              />
                            </Col>
                            <Col md={6}>
                              <EditableField
                                alignField="horizontalWide"
                                component={textField}
                                currentValue={_.isEmpty(data.event.affectation) ? "-" : data.event.affectation}
                                label={translate.t("search_findings.tab_events.affectation")}
                                name="affectation"
                                renderAsEditable={false}
                                type="text"
                              />
                            </Col>
                          </Row>
                          <Row>
                            {!_.isEmpty(data.event.affectedComponents) ? (
                              <Col md={6}>
                                <EditableField
                                  alignField="horizontalWide"
                                  component={textField}
                                  currentValue={data.event.affectedComponents}
                                  label={translate.t("search_findings.tab_events.affected_components")}
                                  name="affectedComponents"
                                  renderAsEditable={false}
                                  type="text"
                                />
                              </Col>
                            ) : undefined}
                            <Col md={6}>
                              <EditableField
                                alignField="horizontalWide"
                                component={textField}
                                currentValue={data.event.accessibility}
                                label={translate.t("search_findings.tab_events.event_in")}
                                name="accessibility"
                                renderAsEditable={false}
                                type="text"
                              />
                            </Col>
                          </Row>
                        </React.Fragment>
                      )}
                    </GenericForm>
                  );
                }}
              </Mutation>
            </React.Fragment>
          );
        }}
      </Query>
    </React.StrictMode>
  );
};

export { eventDescriptionView as EventDescriptionView };
