# pylint: disable=import-error
import re

from ariadne import convert_kwargs_to_snake_case
from backend import util


@convert_kwargs_to_snake_case
def resolve_invalidate_cache(_, info, pattern):
    """Resolve invalidate_cache."""
    success = False
    regex = r'^\w+$'
    if re.match(regex, pattern):
        util.invalidate_cache(pattern)
        success = True
        util.cloudwatch_log(
            info.context,
            f'Security: Pattern {pattern} was removed from cache')
    return dict(success=success)
