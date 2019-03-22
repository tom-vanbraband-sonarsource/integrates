import React from "react";
import { default as avabilityHighIcon } from "../../resources/availability_high.svg";
import { default as avabilityLowIcon } from "../../resources/availability_low.svg";
import { default as avabilityNoneIcon } from "../../resources/availability_none.svg";
import { default as calendarIcon } from "../../resources/calendar.svg";
import { default as complexityHighIcon } from "../../resources/complexity_high.svg";
import { default as complexityLowIcon } from "../../resources/complexity_low.svg";
import { default as confidentialityHighIcon } from "../../resources/confidentiality_high.svg";
import { default as confidentialityLowIcon } from "../../resources/confidentiality_low.svg";
import { default as confidentialityNoneIcon } from "../../resources/confidentiality_none.svg";
import { default as defaultIcon } from "../../resources/default_finding_state.svg";
import { default as deleteIcon } from "../../resources/delete.svg";
import { default as editIcon } from "../../resources/edit.svg";
import { default as exportIcon } from "../../resources/export.svg";
import { default as failIcon } from "../../resources/fail.svg";
import { default as findingsIcon } from "../../resources/findings.svg";
import { default as fixedVulnerabilitiesIcon } from "../../resources/fixed_vulnerabilities.svg";
import { default as graphIcon } from "../../resources/graph.svg";
import { default as integrityHighIcon } from "../../resources/integrity_high.svg";
import { default as integrityLowIcon } from "../../resources/integrity_low.svg";
import { default as integrityNoneIcon } from "../../resources/integrity_none.svg";
import { default as okIcon } from "../../resources/ok.svg";
import { default as openVulnerabilitiesIcon } from "../../resources/open_vulnerabilities.svg";
import { default as privilegesHighIcon } from "../../resources/privileges_high.svg";
import { default as privilegesLowIcon } from "../../resources/privileges_low.svg";
import { default as privilegesNoneIcon } from "../../resources/privileges_none.svg";
import { default as scopeChangedIcon } from "../../resources/scope_changed.svg";
import { default as scopeUnchangedIcon } from "../../resources/scope_unchanged.svg";
import { default as searchIcon } from "../../resources/search.svg";
import { default as terminalIcon } from "../../resources/terminal.svg";
import { default as totalIcon } from "../../resources/total.svg";
import { default as totalVulnerabilitiesIcon } from "../../resources/total_vulnerabilities.svg";
import { default as userNoneIcon } from "../../resources/user_none.svg";
import { default as userRequiredIcon } from "../../resources/user_required.svg";
import { default as vectorAdjacentIcon } from "../../resources/vector_adjacent.svg";
import { default as vectorLocalIcon } from "../../resources/vector_local.svg";
import { default as vectorNetworkIcon } from "../../resources/vector_network.svg";
import { default as vectorPhysicalIcon } from "../../resources/vector_physical.svg";
import { default as vulnerabilitiesIcon } from "../../resources/vulnerabilities.svg";

interface IFluidIconProps {
    height?: string;
    icon: string;
    width?: string;
}

const getIcon: {[value: string]: string} = {
    availabilityHigh: avabilityHighIcon,
    availabilityLow: avabilityLowIcon,
    availabilityNone: avabilityNoneIcon,
    calendar: calendarIcon,
    circle: defaultIcon,
    complexityHigh: complexityHighIcon,
    complexityLow: complexityLowIcon,
    confidentialityHigh: confidentialityHighIcon,
    confidentialityLow: confidentialityLowIcon,
    confidentialityNone: confidentialityNoneIcon,
    delete: deleteIcon,
    edit: editIcon,
    export: exportIcon,
    fail: failIcon,
    findings: findingsIcon,
    fixedVulnerabilities: fixedVulnerabilitiesIcon,
    graph: graphIcon,
    integrityHigh: integrityHighIcon,
    integrityLow: integrityLowIcon,
    integrityNone: integrityNoneIcon,
    ok: okIcon,
    openVulnerabilities: openVulnerabilitiesIcon,
    privilegesHigh: privilegesHighIcon,
    privilegesLow: privilegesLowIcon,
    privilegesNone: privilegesNoneIcon,
    scopeChanged: scopeChangedIcon,
    scopeUnchanged: scopeUnchangedIcon,
    search: searchIcon,
    terminal: terminalIcon,
    total: totalIcon,
    totalVulnerabilities: totalVulnerabilitiesIcon,
    userNone: userNoneIcon,
    userRequired: userRequiredIcon,
    vectorAdjacent: vectorAdjacentIcon,
    vectorLocal: vectorLocalIcon,
    vectorNetwork: vectorNetworkIcon,
    vectorPhysical: vectorPhysicalIcon,
    vulnerabilities: vulnerabilitiesIcon,
  };

const fluidIcon: React.StatelessComponent<IFluidIconProps> = (props: IFluidIconProps): JSX.Element => (
    <React.StrictMode>
         <object width={props.width} height={props.height} data={getIcon[props.icon]} />
    </React.StrictMode>
  );

fluidIcon.defaultProps = {
    height: "50",
    icon: "ok",
    width: "50",
};

export { fluidIcon as FluidIcon };