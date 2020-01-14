
# -*- coding: utf-8 -*-
""" FluidIntegrates cvss auxiliar functions. """

from decimal import Decimal
import math


def _calc_cvss2_temporal(severity, basescore):
    """Calculate cvss v2 temporal attribute."""
    temporal = Decimal(float(basescore) * severity['exploitability'] *
                       severity['resolutionLevel'] *
                       severity['confidenceLevel'])
    resp = temporal.quantize(Decimal("0.1"))
    return resp


def _calc_cvss2_basescore(severity, parameters):
    """Calculate cvss v2 base score attribute."""
    impact = parameters['impact_factor'] * \
        (1 - ((1 - severity['confidentialityImpact']) *
              (1 - severity['integrityImpact']) *
              (1 - severity['availabilityImpact'])))
    f_impact_factor = get_f_impact(impact)
    exploitabilty = parameters['exploitability_factor'] * severity['accessComplexity'] * \
        severity['authentication'] * severity['accessVector']
    basescore = Decimal(((parameters['bs_factor_1'] * impact) -
                        parameters['bs_factor_3'] + (parameters['bs_factor_2'] *
                        exploitabilty)) * f_impact_factor)
    resp = basescore.quantize(Decimal("0.1"))
    return resp


def _calc_cvss2_environment(severity, parameters):
    """Calculate cvss v2 environment attribute."""
    exploitabilty = parameters['exploitability_factor'] * severity['accessComplexity'] * \
        severity['authentication'] * severity['accessVector']
    adj_impact = min(10, parameters['impact_factor'] *
                     (1 - (1 - severity['confidentialityImpact'] *
                           severity['confidentialityRequirement']) *
                     (1 - severity['integrityImpact'] *
                      severity['integrityRequirement']) *
                     (1 - severity['availabilityImpact'] *
                      severity['availabilityRequirement'])))
    f_impact_factor = get_f_impact(adj_impact)
    adj_basescore = ((parameters['bs_factor_1'] * adj_impact) -
                     parameters['bs_factor_3'] + (parameters['bs_factor_2'] *
                                                  exploitabilty)) * \
        f_impact_factor
    adj_temporal = round(adj_basescore * severity['exploitability'] *
                         severity['resolutionLevel'] *
                         severity['confidenceLevel'], 1)
    cvss_env = Decimal((adj_temporal + (10 - adj_temporal) *
                        severity['collateralDamagePotential']) *
                       severity['findingDistribution'])
    resp = cvss_env.quantize(Decimal("0.1"))
    return resp


def _calc_cvss3_basescore(severity, parameters):
    """Calculate cvss v3 base score attribute."""
    iss = 1 - ((1 - severity['confidentialityImpact']) *
               (1 - severity['integrityImpact']) *
               (1 - severity['availabilityImpact']))
    if severity['severityScope']:
        impact = ((parameters['impact_factor_2'] *
                  (iss - parameters['impact_factor_3'])) -
                  (parameters['impact_factor_4'] *
                  (iss - parameters['impact_factor_5'])**parameters['impact_factor_6']))
    else:
        impact = parameters['impact_factor_1'] * iss
    exploitability = (parameters['exploitability_factor_1'] *
                      severity['attackVector'] * severity['attackComplexity'] *
                      severity['privilegesRequired'] * severity['userInteraction'])
    if impact <= 0:
        basescore = Decimal(0)
    else:
        if severity['severityScope']:
            basescore = Decimal(math.ceil(min(
                parameters['basescore_factor'] *
                (impact + exploitability), 10) * 10) / 10)
        else:
            basescore = Decimal(math.ceil(min(impact + exploitability, 10) * 10) / 10)
    resp = basescore.quantize(Decimal("0.1"))
    return resp


def _calc_cvss3_temporal(severity, basescore):
    """Calculate cvss v3 temporal attribute."""
    temporal = Decimal(math.ceil(float(basescore) * severity['exploitability'] *
                                 severity['remediationLevel'] *
                                 severity['reportConfidence'] * 10) / 10)
    resp = temporal.quantize(Decimal("0.1"))
    return resp


def _calc_cvss3_environment(severity, parameters):
    """Calculate cvss v3 environment attribute."""
    mi_conf = severity['modifiedConfidentialityImpact']
    mi_integ = severity['modifiedIntegrityImpact']
    mi_avail = severity['modifiedAvailabilityImpact']
    miss = \
        min(1 - (1 - mi_conf * severity['confidentialityRequirement']) *
                (1 - mi_integ * severity['integrityRequirement']) *
                (1 - mi_avail * severity['availabilityRequirement']),
            parameters['mod_impact_factor_1'])
    if severity['modifiedSeverityScope']:
        impact = ((parameters['mod_impact_factor_3'] *
                  (miss - parameters['mod_impact_factor_4'])) -
                  (parameters['mod_impact_factor_5'] *
                  ((miss * parameters['mod_impact_factor_8']) -
                   parameters['mod_impact_factor_6'])**parameters['mod_impact_factor_7']))
    else:
        impact = (parameters['mod_impact_factor_2'] * miss)
    exploitability = (parameters['exploitability_factor_1'] *
                      severity['modifiedAttackVector'] *
                      severity['modifiedAttackComplexity'] *
                      severity['modifiedPrivilegesRequired'] *
                      severity['modifiedUserInteraction'])
    if impact <= 0:
        environmental = Decimal(0)
    else:
        if severity['modifiedSeverityScope']:
            environmental = Decimal(math.ceil(
                math.ceil(min(parameters['basescore_factor'] *
                          (impact + exploitability), 10) * 10) / 10 *
                severity['exploitability'] * severity['remediationLevel'] *
                severity['reportConfidence'] * 10) / 10)
        else:
            environmental = Decimal(math.ceil(
                math.ceil(min(impact + exploitability, 10) * 10) / 10 *
                severity['exploitability'] * severity['remediationLevel'] *
                severity['reportConfidence'] * 10) / 10)
    resp = environmental.quantize(Decimal("0.1"))
    return resp


def get_f_impact(impact):
    if impact:
        f_impact_factor = 1.176
    else:
        f_impact_factor = 0
    return f_impact_factor


def calculate_cvss_temporal(severity, basescore, version):
    """Calculate cvss temporal attribute."""
    if version == '3.1':
        cvss_temporal = _calc_cvss3_temporal(severity, basescore)
    else:
        cvss_temporal = _calc_cvss2_temporal(severity, basescore)
    return cvss_temporal


def calculate_cvss_basescore(severity, parameters, version):
    """Calculate cvss base score attribute."""
    if version == '3.1':
        cvss_basescore = _calc_cvss3_basescore(severity, parameters)
    else:
        cvss_basescore = _calc_cvss2_basescore(severity, parameters)
    return cvss_basescore


def calculate_cvss_environment(severity, parameters, version):
    """Calculate cvss environment attribute."""
    if version == '3.1':
        cvss_environment = _calc_cvss3_environment(severity, parameters)
    else:
        cvss_environment = _calc_cvss2_environment(severity, parameters)
    return cvss_environment


def calculate_privileges(privileges, scope):
    """Calculate privileges attribute."""
    if scope:
        if privileges == 0.62:
            privileges = 0.68
        elif privileges == 0.27:
            privileges = 0.5
    else:
        if privileges == 0.68:
            privileges = 0.62
        elif privileges == 0.5:
            privileges = 0.27

    return privileges
