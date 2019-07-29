# pylint: disable=E0402
from ..dao import integrates_dao


# pylint: disable=no-self-use
class IntercomUserData(object):
    def user_data(self, user):
        """ Required method, same name and only accepts
            one attribute (django User model) """
        name = user.get_full_name()
        email = user.get_username()
        return {
            'name': name,
            'email': email,
        }


class IntercomCustomData(object):
    """ Custom data class. """
    def custom_data(self, user):
        """ Send extra data to Intercom. """
        email = user.get_username()
        company = integrates_dao.get_organization_dao(email)
        return {
            'Company': company,
        }
