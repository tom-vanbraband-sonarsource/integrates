/* tslint:disable:jsx-no-multiline-js
 * NO-MULTILINE-JS: Disabling this rule is necessary for the sake of
  * readability of the code that defines the headers of the table
 */
import _ from "lodash";
import mixpanel from "mixpanel-browser";
import React from "react";
import { Mutation, MutationFn, MutationResult, Query, QueryResult } from "react-apollo";
import { ButtonToolbar, Col, ControlLabel, FormGroup, Glyphicon, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Field, FormSection, formValueSelector, InjectedFormProps } from "redux-form";
import { Button } from "../../../../components/Button";
import { dataTable as DataTable, IHeader } from "../../../../components/DataTable/index";
import { Modal } from "../../../../components/Modal";
import globalStyle from "../../../../styles/global.css";
import { hidePreloader, showPreloader } from "../../../../utils/apollo";
import { formatEvents, handleGraphQLErrors } from "../../../../utils/formatHelpers";
import { checkboxField, dateTimeField, dropdownField, textAreaField, textField } from "../../../../utils/forms/fields";
import { msgSuccess } from "../../../../utils/notifications";
import translate from "../../../../utils/translations/translate";
import { numeric, required, someRequired, validEmail } from "../../../../utils/validations";
import { GenericForm } from "../../components/GenericForm";
import { CREATE_EVENT_MUTATION, GET_EVENTS } from "./queries";
import { IEventsAttr, IEventViewBaseProps } from "./types";

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
const projectEventsView: React.FunctionComponent<IEventViewBaseProps> = (props: IEventViewBaseProps): JSX.Element => {
  const { projectName } = props.match.params;
  const handleQryResult: ((qrResult: IEventsAttr) => void) = (): void => {
    mixpanel.track("ProjectEvents", {
      Organization: (window as typeof window & { userOrganization: string }).userOrganization,
      User: (window as typeof window & { userName: string }).userName,
    });
    hidePreloader();
  };

  const goToEvent: ((rowInfo: { id: string }) => void) = (rowInfo: { id: string }): void => {
    mixpanel.track("ReadEvent", {
      Organization: (window as typeof window & { userOrganization: string }).userOrganization,
      User: (window as typeof window & { userName: string }).userName,
    });
    location.hash = `#!/project/${projectName}/events/${rowInfo.id}/description`;
  };

  const [isEventModalOpen, setEventModalOpen] = React.useState(false);

  const openNewEventModal: (() => void) = (): void => {
    setEventModalOpen(true);
  };

  const closeNewEventModal: (() => void) = (): void => {
    setEventModalOpen(false);
  };

  const selector: (state: {}, ...field: string[]) => string = formValueSelector("newEvent");
  const eventType: string = useSelector((state: {}) => selector(state, "eventType"));

  return (
    <Query query={GET_EVENTS} variables={{ projectName }} onCompleted={handleQryResult}>
      {
        ({ data, error, loading, refetch }: QueryResult<IEventsAttr>): React.ReactNode => {
          if (loading) {
            showPreloader();

            return <React.Fragment />;
          }
          if (!_.isUndefined(error)) {
            hidePreloader();
            handleGraphQLErrors("An error occurred getting eventualities", error);

            return <React.Fragment />;
          }
          if (!_.isUndefined(data)) {
            const handleMutationResult: ((result: { createEvent: { success: boolean } }) => void) = (
              result: { createEvent: { success: boolean } },
            ): void => {
              if (result.createEvent.success) {
                closeNewEventModal();
                msgSuccess(
                  translate.t("project.events.success_create"),
                  translate.t("project.events.title_success"),
                );
                refetch()
                  .catch();
              }
            };

            return (
              <React.StrictMode>
                <Row>
                  <Col md={2} mdOffset={5}>
                    <ButtonToolbar>
                      {(window as typeof window & { userRole: string }).userRole === "admin"
                        ? <Button onClick={openNewEventModal}>
                          <Glyphicon glyph="plus" />&nbsp;{translate.t("project.events.new")}
                        </Button>
                        : undefined}
                    </ButtonToolbar>
                  </Col>
                </Row>
                <Modal
                  footer={<div />}
                  headerTitle={translate.t("project.events.new")}
                  onClose={closeNewEventModal}
                  open={isEventModalOpen}
                >
                  <Mutation mutation={CREATE_EVENT_MUTATION} onCompleted={handleMutationResult}>
                    {(createEvent: MutationFn, { loading: submitting }: MutationResult): React.ReactNode => {
                      interface IFormValues {
                        accessibility: { [key: string]: boolean };
                        affectedComponents: { [key: string]: boolean };
                      }

                      const handleSubmit: ((values: IFormValues) => void) = (values: IFormValues): void => {
                        const selectedAccessibility: string[] = Object.keys(values.accessibility)
                          .filter((key: string) => values.accessibility[key])
                          .map((key: string) => key.toUpperCase());

                        const selectedComponents: string[] = Object.keys(values.affectedComponents)
                          .filter((key: string) => values.affectedComponents[key])
                          .map((key: string) => key.toUpperCase());

                        createEvent({
                          variables: {
                            projectName,
                            ...values,
                            accessibility: selectedAccessibility,
                            affectedComponents: selectedComponents,
                          },
                        })
                          .catch();
                      };

                      return (
                        <GenericForm name="newEvent" onSubmit={handleSubmit}>
                          {({ pristine }: InjectedFormProps): JSX.Element => (
                            <React.Fragment>
                              <Row>
                                <Col md={5}>
                                  <FormGroup>
                                    <ControlLabel>{translate.t("project.events.form.date")}</ControlLabel>
                                    <Field component={dateTimeField} name="eventDate" validate={required} />
                                  </FormGroup>
                                </Col>
                                <Col md={7}>
                                  <FormGroup>
                                    <ControlLabel>{translate.t("project.events.form.type.title")}</ControlLabel>
                                    <Field component={dropdownField} name="eventType" validate={required}>
                                      <option value="" selected={true} />
                                      <option value="AUTHORIZATION_SPECIAL_ATTACK">
                                        {translate.t("project.events.form.type.special_attack")}
                                      </option>
                                      <option value="CLIENT_APPROVES_CHANGE_TOE">
                                        {translate.t("project.events.form.type.toe_change")}
                                      </option>
                                      <option value="CLIENT_CANCELS_PROJECT_MILESTONE">
                                        {translate.t("project.events.form.type.cancel_project")}
                                      </option>
                                      <option value="CLIENT_DETECTS_ATTACK">
                                        {translate.t("project.events.form.type.detects_attack")}
                                      </option>
                                      <option value="CLIENT_EXPLICITLY_SUSPENDS_PROJECT">
                                        {translate.t("project.events.form.type.suspends_project")}
                                      </option>
                                      <option value="HIGH_AVAILABILITY_APPROVAL">
                                        {translate.t("project.events.form.type.high_availability")}
                                      </option>
                                      <option value="INCORRECT_MISSING_SUPPLIES">
                                        {translate.t("project.events.form.type.missing_supplies")}
                                      </option>
                                      <option value="TOE_DIFFERS_APPROVED">
                                        {translate.t("project.events.form.type.toe_differs")}
                                      </option>
                                      <option value="OTHER">
                                        {translate.t("project.events.form.other")}
                                      </option>
                                    </Field>
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={4}>
                                  <FormGroup>
                                    <ControlLabel>{translate.t("project.events.form.context.title")}</ControlLabel>
                                    <Field component={dropdownField} name="context" validate={required}>
                                      <option value="" selected={true} />
                                      <option value="CLIENT">
                                        {translate.t("project.events.form.context.client")}
                                      </option>
                                      <option value="FLUID">
                                        {translate.t("project.events.form.context.fluid")}
                                      </option>
                                      <option value="PLANNING">
                                        {translate.t("project.events.form.context.planning")}
                                      </option>
                                      <option value="TELECOMMUTING">
                                        {translate.t("project.events.form.context.telecommuting")}
                                      </option>
                                      <option value="OTHER">
                                        {translate.t("project.events.form.other")}
                                      </option>
                                    </Field>
                                  </FormGroup>
                                </Col>
                                <Col md={5}>
                                  <FormGroup>
                                    <ControlLabel>
                                      {translate.t("project.events.form.responsible")}
                                    </ControlLabel>
                                    <Field component={textField} name="clientResponsible" validate={validEmail} />
                                  </FormGroup>
                                </Col>
                                <Col md={3}>
                                  <FormGroup>
                                    <ControlLabel>
                                      {translate.t("project.events.form.accessibility.title")}
                                    </ControlLabel>
                                    <FormSection name="accessibility">
                                      <Field component={checkboxField} name="environment" validate={someRequired}>
                                        {translate.t("project.events.form.accessibility.environment")}
                                      </Field>
                                      <Field component={checkboxField} name="repository" validate={someRequired}>
                                        {translate.t("project.events.form.accessibility.repository")}
                                      </Field>
                                    </FormSection>
                                  </FormGroup>
                                </Col>
                              </Row>
                              {eventType === "INCORRECT_MISSING_SUPPLIES" ?
                                <Row>
                                  <Col md={6}>
                                    <FormGroup>
                                      <ControlLabel>{translate.t("project.events.form.blocking_hours")}</ControlLabel>
                                      <Field
                                        component={textField}
                                        name="blockingHours"
                                        type="number"
                                        validate={[numeric, required]}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col md={6}>
                                    <FormGroup>
                                      <ControlLabel>
                                        {translate.t("project.events.form.components.title")}
                                      </ControlLabel>
                                      <FormSection name="affectedComponents">
                                        <Field component={checkboxField} name="FLUID_STATION" validate={someRequired}>
                                          {translate.t("project.events.form.components.fluid_station")}
                                        </Field>
                                        <Field component={checkboxField} name="CLIENT_STATION" validate={someRequired}>
                                          {translate.t("project.events.form.components.client_station")}
                                        </Field>
                                        <Field component={checkboxField} name="TOE_EXCLUSSION" validate={someRequired}>
                                          {translate.t("project.events.form.components.toe_exclussion")}
                                        </Field>
                                        <Field component={checkboxField} name="DOCUMENTATION" validate={someRequired}>
                                          {translate.t("project.events.form.components.documentation")}
                                        </Field>
                                        <Field
                                          component={checkboxField}
                                          name="LOCAL_CONNECTION"
                                          validate={someRequired}
                                        >
                                          {translate.t("project.events.form.components.local_conn")}
                                        </Field>
                                        <Field
                                          component={checkboxField}
                                          name="INTERNET_CONNECTION"
                                          validate={someRequired}
                                        >
                                          {translate.t("project.events.form.components.internet_conn")}
                                        </Field>
                                        <Field component={checkboxField} name="VPN_CONNECTION" validate={someRequired}>
                                          {translate.t("project.events.form.components.vpn_conn")}
                                        </Field>
                                        <Field component={checkboxField} name="TOE_LOCATION" validate={someRequired}>
                                          {translate.t("project.events.form.components.toe_location")}
                                        </Field>
                                        <Field component={checkboxField} name="TOE_CREDENTIALS" validate={someRequired}>
                                          {translate.t("project.events.form.components.toe_credentials")}
                                        </Field>
                                        <Field component={checkboxField} name="TOE_PRIVILEGES" validate={someRequired}>
                                          {translate.t("project.events.form.components.toe_privileges")}
                                        </Field>
                                        <Field component={checkboxField} name="TEST_DATA" validate={someRequired}>
                                          {translate.t("project.events.form.components.test_data")}
                                        </Field>
                                        <Field component={checkboxField} name="TOE_UNSTABLE" validate={someRequired}>
                                          {translate.t("project.events.form.components.toe_unstability")}
                                        </Field>
                                        <Field
                                          component={checkboxField}
                                          name="TOE_UNACCESSIBLE"
                                          validate={someRequired}
                                        >
                                          {translate.t("project.events.form.components.toe_unaccessible")}
                                        </Field>
                                        <Field component={checkboxField} name="TOE_UNAVAILABLE" validate={someRequired}>
                                          {translate.t("project.events.form.components.toe_unavailable")}
                                        </Field>
                                        <Field component={checkboxField} name="TOE_ALTERATION" validate={someRequired}>
                                          {translate.t("project.events.form.components.toe_alteration")}
                                        </Field>
                                        <Field component={checkboxField} name="SOURCE_CODE" validate={someRequired}>
                                          {translate.t("project.events.form.components.source_code")}
                                        </Field>
                                        <Field component={checkboxField} name="COMPILE_ERROR" validate={someRequired}>
                                          {translate.t("project.events.form.components.compile_error")}
                                        </Field>
                                        <Field component={checkboxField} name="OTHER" validate={someRequired}>
                                          {translate.t("project.events.form.other")}
                                        </Field>
                                      </FormSection>
                                    </FormGroup>
                                  </Col>
                                </Row>
                                : undefined}
                              <Row>
                                <Col md={12}>
                                  <FormGroup>
                                    <ControlLabel>{translate.t("project.events.form.details")}</ControlLabel>
                                    <Field
                                      className={globalStyle.noResize}
                                      component={textAreaField}
                                      name="detail"
                                      validate={required}
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={5}>
                                  <FormGroup>
                                    <ControlLabel>
                                      {translate.t("project.events.form.action_before.title")}
                                    </ControlLabel>
                                    <Field component={dropdownField} name="actionBeforeBlocking" validate={required}>
                                      <option value="" selected={true} />
                                      <option value="DOCUMENT_PROJECT">
                                        {translate.t("project.events.form.action_before.document")}
                                      </option>
                                      <option value="TEST_OTHER_PART_TOE">
                                        {translate.t("project.events.form.action_before.test_other")}
                                      </option>
                                      <option value="NONE">
                                        {translate.t("project.events.form.none")}
                                      </option>
                                      <option value="OTHER">
                                        {translate.t("project.events.form.other")}
                                      </option>
                                    </Field>
                                  </FormGroup>
                                </Col>
                                <Col md={7}>
                                  <FormGroup>
                                    <ControlLabel>{translate.t("project.events.form.action_after.title")}</ControlLabel>
                                    <Field component={dropdownField} name="actionAfterBlocking" validate={required}>
                                      <option value="" selected={true} />
                                      <option value="EXECUTE_OTHER_PROJECT_SAME_CLIENT">
                                        {translate.t("project.events.form.action_after.other_same")}
                                      </option>
                                      <option value="EXECUTE_OTHER_PROJECT_OTHER_CLIENT">
                                        {translate.t("project.events.form.action_after.other_other")}
                                      </option>
                                      <option value="TRAINING">
                                        {translate.t("project.events.form.action_after.training")}
                                      </option>
                                      <option value="NONE">
                                        {translate.t("project.events.form.none")}
                                      </option>
                                      <option value="OTHER">
                                        {translate.t("project.events.form.other")}
                                      </option>
                                    </Field>
                                  </FormGroup>
                                </Col>
                              </Row>
                              <ButtonToolbar className="pull-right">
                                <Button bsStyle="success" onClick={closeNewEventModal}>
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
                <p>{translate.t("search_findings.tab_events.table_advice")}</p>
                <DataTable
                  dataset={formatEvents(data.project.events)}
                  enableRowSelection={false}
                  exportCsv={true}
                  onClickRow={goToEvent}
                  search={true}
                  headers={tableHeaders}
                  id="tblEvents"
                  pageSize={15}
                  title=""
                  selectionMode="none"
                />
              </React.StrictMode>
            );
          }
        }}
    </Query>
  );
};

export { projectEventsView as ProjectEventsView };
