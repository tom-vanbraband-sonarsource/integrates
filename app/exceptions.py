""" Implementation of custom exceptions for FluidIntegrates. """


class SecureAccessException(Exception):
    """ Exception that controls access to resources with authentication. """
    def __init__(self):
        """ Constructor """
        msg = "Exception - Access to resources without active session"
        super(SecureAccessException, self).__init__(msg)


class SecureParamsException(Exception):
    """ Exception to control parameter validation. """
    def __init__(self):
        """ Constructor """
        msg = "Exception - Incorrect or missing parameters"
        super(SecureParamsException, self).__init__(msg)


class APIConnectionException(Exception):
    """ Exception to control communication with the backend. """
    def __init__(self):
        """ Constructor """
        msg = "Excepcion - Error de conexion con el servidor"
        super(APIConnectionException, self).__init__(msg)


class LogicException(Exception):
    """ Exception to control general logical errors. """
    def __init__(self, code=99):
        """ Constructor. """
        if code == 100:
            msg = "E100 - Username or Password is incorrect"
        elif code == 101:
            msg = "E101 - Other"
        else:
            msg = "E102 - Unexpected error"
        super(LogicException, self).__init__(msg)


class InvalidRange(Exception):
    """Exception to control valid range in vulnerabilities."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Error in range limit numbers'
        super(InvalidRange, self).__init__(msg)


class InvalidSchema(Exception):
    """Exception to control schema validation."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Invalid Schema'
        super(InvalidSchema, self).__init__(msg)