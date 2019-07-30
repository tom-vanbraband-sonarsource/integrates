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


class InvalidFileSize(Exception):
    """Exception to control file size."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Invalid File Size'
        super(InvalidFileSize, self).__init__(msg)


class InvalidFileType(Exception):
    """Exception to control file type."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Invalid File Type'
        super(InvalidFileType, self).__init__(msg)


class ErrorUploadingFileS3(Exception):
    """Exception to control upload of files in s3."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Error Uploading File to S3'
        super(ErrorUploadingFileS3, self).__init__(msg)


class InvalidAuthorization(Exception):
    """Exception to control authorization."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Invalid Authorization'
        super(InvalidAuthorization, self).__init__(msg)


class InvalidPath(Exception):
    """Exception to control valid path value in vulnerabilities."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Error in path value'
        super(InvalidPath, self).__init__(msg)


class InvalidPort(Exception):
    """Exception to control valid port value in vulnerabilities."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Error in port value'
        super(InvalidPort, self).__init__(msg)


class InvalidSpecific(Exception):
    """Exception to control valid specific value in vulnerabilities."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Error in specific value'
        super(InvalidSpecific, self).__init__(msg)


class InvalidProject(Exception):
    """Exception to control a valid project."""
    def __init__(self):
        """ Constructor """
        msg = 'Exception - Project does not exist'
        super(InvalidProject, self).__init__(msg)


class ForbiddenField(Exception):
    """Exception to control graphql api fields."""

    def __init__(self):
        """ Constructor """
        msg = 'Exception - Requested field not allowed'
        super(ForbiddenField, self).__init__(msg)


class QueryDepthExceeded(Exception):
    """Exception to control graphql max query depth"""

    def __init__(self):
        """ Constructor """
        msg = 'Exception - Max query depth exceeded'
        super(QueryDepthExceeded, self).__init__(msg)


class FindingNotFound(Exception):
    """Exception to control finding data availability"""

    def __init__(self):
        """ Constructor """
        msg = 'Exception - Finding not found'
        super(FindingNotFound, self).__init__(msg)
