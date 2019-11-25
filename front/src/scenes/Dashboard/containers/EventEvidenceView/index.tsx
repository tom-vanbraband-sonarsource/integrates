/* tslint:disable:jsx-no-multiline-js
 *
 * Disabling this rule is necessary for accessing render props from
 * apollo components
 */
import { ApolloError } from "apollo-client";
import { GraphQLError } from "graphql";
import _ from "lodash";
import React from "react";
import { Mutation, MutationFn, Query, QueryResult } from "react-apollo";
import { Col, Glyphicon, Row } from "react-bootstrap";
import Lightbox from "react-image-lightbox";
import { RouteComponentProps } from "react-router";
import { Button } from "../../../../components/Button";
import { FluidIcon } from "../../../../components/FluidIcon";
import { hidePreloader, showPreloader } from "../../../../utils/apollo";
import { msgError } from "../../../../utils/notifications";
import rollbar from "../../../../utils/rollbar";
import translate from "../../../../utils/translations/translate";
import { validEventImage } from "../../../../utils/validations";
import { evidenceImage as EvidenceImage } from "../../components/EvidenceImage/index";
import style from "./index.css";
import { GET_EVENT_EVIDENCES, UPDATE_EVIDENCE_MUTATION } from "./queries";

type EventEvidenceProps = RouteComponentProps<{ eventId: string; projectName: string }>;

const eventEvidenceView: React.FC<EventEvidenceProps> = (props: EventEvidenceProps): JSX.Element => {
  const { eventId } = props.match.params;

  const emptyImage: string = (
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  );
  const [isEditing, setEditing] = React.useState(false);
  const handleEditClick: (() => void) = (): void => { setEditing(!isEditing); };

  const [isImageOpen, setImageOpen] = React.useState(false);
  const closeImage: (() => void) = (): void => { setImageOpen(false); };
  const openImage: (() => void) = (): void => { if (!isEditing) { setImageOpen(true); } };

  const baseUrl: string = window.location.href.replace("dashboard#!/", "");

  return (
    <React.StrictMode>
      <Row>
        <Col md={2} mdOffset={10} xs={12} sm={12}>
          {_.includes(["admin", "analyst"], (window as typeof window & { userRole: string }).userRole)
            ? (
              <Button block={true} onClick={handleEditClick}>
                <FluidIcon icon="edit" />&nbsp;{translate.t("project.events.evidence.edit")}
              </Button>
            )
            : undefined}
        </Col>
      </Row>
      <Query query={GET_EVENT_EVIDENCES} variables={{ eventId }}>
        {({ data, loading, refetch }: QueryResult): JSX.Element => {
          if (_.isUndefined(data) || loading) { return <React.Fragment />; }

          const renderLightbox: (() => JSX.Element) = (): JSX.Element => {
            const adjustZoom: (() => void) = (): void => {
              /**
               * As a workaround to a bug in this component,
               * we need trigger the resize event for it to
               * properly calculate the image scale
               */
              setTimeout((): void => { window.dispatchEvent(new Event("resize")); }, 50);
            };

            return (
              <Lightbox
                mainSrc={`${baseUrl}/${data.event.evidence}`}
                imagePadding={50}
                onAfterOpen={adjustZoom}
                onCloseRequest={closeImage}
                reactModalStyle={{ overlay: { zIndex: "1200" } }}
              />
            );
          };

          const handleUpdateResult: (() => void) = (): void => {
            hidePreloader();
            refetch()
              .catch();
          };
          const handleUpdateError: ((updateError: ApolloError) => void) = (updateError: ApolloError): void => {
            hidePreloader();
            updateError.graphQLErrors.forEach(({ message }: GraphQLError): void => {
              switch (message) {
                case "Exception - Invalid File Size":
                  msgError(translate.t("proj_alerts.file_size"));
                  break;
                case "Exception - Invalid File Type: EVENT_IMAGE":
                  msgError(translate.t("project.events.form.wrong_image_type"));
                  break;
                case "Exception - Invalid File Type: EVENT_FILE":
                  msgError(translate.t("project.events.form.wrong_file_type"));
                  break;
                default:
                  msgError(translate.t("proj_alerts.error_textsad"));
                  rollbar.error("An error occurred updating event evidence", updateError);
              }
            });
          };

          return (
            <React.Fragment>
              {_.isEmpty(data.event.evidence) && !isEditing ? (
                <div className={style.noData}>
                  <Glyphicon glyph="picture" />
                  <p>{translate.t("project.events.evidence.no_data")}</p>
                </div>
              ) : undefined}
              {!_.isEmpty(data.event.evidence) || isEditing
                ? <Mutation
                  mutation={UPDATE_EVIDENCE_MUTATION}
                  onCompleted={handleUpdateResult}
                  onError={handleUpdateError}
                >
                  {(updateEvidence: MutationFn): React.ReactNode => {
                    const handleUpdate: ((values: { evidence_filename: FileList }) => void) = (
                      values: { evidence_filename: FileList },
                    ): void => {
                      showPreloader();
                      updateEvidence({
                        variables: { eventId, evidenceType: "IMAGE", file: values.evidence_filename[0] },
                      })
                        .catch();
                      setEditing(false);
                    };

                    return (
                      <EvidenceImage
                        description="Evidence"
                        isDescriptionEditable={false}
                        isEditing={isEditing}
                        name="evidence"
                        onClick={openImage}
                        onUpdate={handleUpdate}
                        url={_.isEmpty(data.event.evidence) ? emptyImage : `${baseUrl}/${data.event.evidence}`}
                        validate={validEventImage}
                      />
                    );
                  }}
                </Mutation>
                : undefined}
              {isImageOpen ? renderLightbox() : undefined}
            </React.Fragment>
          );
        }}
      </Query>
    </React.StrictMode>
  );
};

export { eventEvidenceView as EventEvidenceView };
