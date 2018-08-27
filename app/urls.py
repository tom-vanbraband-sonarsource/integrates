""" File for linking routes between http queries and django views. """

# pylint: disable=E0402
from . import views
from . import services
from django.conf.urls import url, include, handler400, handler403, handler404, handler500

# pylint: disable=W0104
handler400, handler403, handler404, handler500;

handler400 = 'app.views.error500'
handler401 = 'app.views.error401'
handler403 = 'app.views.error401'
handler404 = 'app.views.error500'
handler500 = 'app.views.error500'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    # Principal process.
    url(r'^index/?$', views.index, name='index'),
    url(r'^error500/?$', views.error500, name='error500'),
    url(r'^error401/?$', views.error401, name='error401'),
    url(r'^login/?$', services.login, name='login'),
    url(r'^logout/?$', views.logout, name='logout'),
    url(r'^dashboard/?$', views.dashboard, name='dashboard'),
    url(r'^registration/?$', views.registration, name='registration'),
    url(r'^oauth/', include('social_django.urls', namespace='social')),
    url(r'^forms/?\.*$', views.forms),
    url(r'^api/?\.*$', views.graphql_api, name='graphql_api'),
    # Project view.
    url(r'^project_indicators/?\.*$', views.project_indicators),
    url(r'^project_findings/?\.*$', views.project_findings),
    url(r'^project_drafts/?\.*$', views.project_drafts),
    url(r'^project_events/?\.*$', views.project_events),
    url(r'^project_resources/?\.*$', views.project_resources),
    url(r'^project_users/?\.*$', views.project_users),
    # Comments tab.
    url(r'^get_comments/?\.*$', views.get_comments, name='get_comments'),
    url(r'^add_comment/?\.*$', views.add_comment, name='add_comment'),
    # Dashboard view.
    url(r'^get_myprojects/?\.*$', views.get_myprojects, name='get_myprojects'),
    url(r'^get_drafts/?\.*$', views.get_drafts, name='get_drafts'),
    url(r'^get_repositories/?\.*$', views.get_repositories, name='get_repositories'),
    url(r'^add_repositories/?\.*$', views.add_repositories, name='add_repositories'),
    url(r'^remove_repositories/?\.*$', views.remove_repositories, name='remove_repositories'),
    url(r'^get_environments/?\.*$', views.get_environments, name='get_repositories'),
    url(r'^add_environments/?\.*$', views.add_environments, name='add_environments'),
    url(r'^remove_environments/?\.*$', views.remove_environments, name='remove_environments'),
    url(r'^delete_project/?\.*$', views.delete_project, name='delete_project'),
    # Use of Formstack services.
    url(r'^get_finding/?\.*$', views.get_finding, name='get_finding'),
    url(r'^get_findings/?\.*$', views.get_findings, name='get_findings'),
    url(r'^total_severity/?\.*$', views.total_severity, name='total_severity'),
    url(r'^get_eventualities/?\.*$',
        views.get_eventualities, name='get_eventualities'),
    url(r'^get_evidences/?\.*$', views.get_evidences, name='get_evidences'),
    url(r'^get_users_login/?\.*$', views.get_users_login, name='get_users_login'),
    url(r'^get_user_data/?\.*$', views.get_user_data, name='get_user_data'),
    url(r'^access_to_project/?\.*$', views.access_to_project, name='access_to_project'),
    url(r'^add_access_integrates/?\.*$', views.add_access_integrates, name='add_access_integrates'),
    url(r'^remove_access_integrates/?\.*$', views.remove_access_integrates, name='remove_access_integrates'),
    url(r'^edit_user/?\.*$', views.edit_user, name='edit_user'),
    url(r'^get_alerts/?\.*$', views.get_alerts, name='get_alerts'),
    url(r'^project/([A-Za-z0-9]+)/(?P<findingid>[0-9]+)/([A-Za-z.=]+)/(?P<fileid>[A-Za-z0-9._-]+)?$', views.get_evidence),
    url(r'^get_exploit/?\.*$', views.get_exploit, name='get_exploit'),
    url(r'^get_records/?\.*$', views.get_records, name='get_records'),
    url(r'^is_customer_admin/?\.*$', views.is_customer_admin, name='is_customer_admin'),
    url(r'^update_eventuality/?\.*$',
        views.update_eventuality, name='update_eventuality'),
    url(r'^delete_finding/?\.*$', views.delete_finding, name='delete_finding'),
    url(r'^accept_draft/?\.*$', views.accept_draft, name='accept_draft'),
    url(r'^delete_draft/?\.*$', views.delete_draft, name='delete_draft'),
    url(r'^finding_solved/?\.*$', views.finding_solved, name='finding_solved'),
    url(r'^update_cssv2/?$', views.update_cssv2, name='update_cssv2'),
    url(r'^update_description/?$', views.update_description, name='update_description'),
    url(r'^update_evidence_text/?$', views.update_evidence_text, name='update_evidence_text'),
    url(r'^update_treatment/?$', views.update_treatment, name='update_treatment'),
    url(r'^get_remediated/?$', views.get_remediated, name='get_remediated'),
    url(r'^finding_verified/?\.*$', views.finding_verified, name='finding_verified'),
    url(r'^update_evidences_files/?\.*$', views.update_evidences_files, name='update_evidences_files'),
    # Documentation.
    url(r'^pdf/(?P<lang>[a-z]{2})/project/(?P<project>[A-Za-z0-9]+)/(?P<doctype>[a-z]+)/?$', views.project_to_pdf),
    url(r'^xls/(?P<lang>[a-z]{2})/project/(?P<project>[A-Za-z0-9]+)/?$', views.project_to_xls),
    url(r'^check_pdf/project/(?P<project>[A-Za-z0-9]+)/?$', views.check_pdf)
]
