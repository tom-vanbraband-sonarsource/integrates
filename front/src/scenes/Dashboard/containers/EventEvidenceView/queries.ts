import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const DOWNLOAD_FILE_MUTATION: DocumentNode = gql`
  mutation DownloadEventFileMutation($eventId: String!, $fileName: String!) {
    downloadEventFile(eventId: $eventId, fileName: $fileName) {
      success
      url
    }
  }
`;

export const GET_EVENT_EVIDENCES: DocumentNode = gql`
  query GetEventEvidences($eventId: String!) {
    event(identifier: $eventId) {
      eventStatus
      evidence
      evidenceFile
      id
    }
  }
`;

export const UPDATE_EVIDENCE_MUTATION: DocumentNode = gql`
  mutation UpdateEventEvidenceMutation($eventId: String!, $evidenceType: EventEvidenceType!, $file: Upload!) {
    updateEventEvidence(eventId: $eventId, evidenceType: $evidenceType, file: $file) {
      success
    }
  }
`;

export const REMOVE_EVIDENCE_MUTATION: DocumentNode = gql`
  mutation RemoveEventEvidenceMutation($eventId: String!, $evidenceType: EventEvidenceType!) {
    removeEventEvidence(eventId: $eventId, evidenceType: $evidenceType) {
      success
    }
  }
`;
