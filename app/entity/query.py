from .alert import Alert
from .login import Login
from .eventuality import Eventuality
# pylint: disable=F0401
from app.api.formstack import FormstackAPI
from graphene import Field, String, ObjectType, List

class Query(ObjectType):
    """ Graphql Class """
    alert = Field(Alert,
                  project=String(required=True),
                  organization=String(required=True))

    eventuality = Field(Eventuality,
                        submitID=String(required=True))

    eventualities = List(Eventuality,
                        project=String(required=True))

    login = Field(Login)


    def resolve_alert(self, info, project=None, organization=None):
        """ Resolve for alert """
        del info
        return Alert(project, organization)

    def resolve_eventuality(self, info, submitID=None):
        """ Resolve for eventuality """
        del info
        return Eventuality(submitID)

    def resolve_eventualities(self, info, project=""):
        """ Resolve for eventualities """
        del info
        resp = FormstackAPI().get_eventualities(str(project))
        data = []
        if "submissions" in resp:
            data = [Eventuality(i["id"]) for i in resp["submissions"]]
        return data

    def resolve_login(self, info):
        """ Resolve for login info """
        user_email = info.context.session["username"]
        return Login(user_email, info.context.session)
