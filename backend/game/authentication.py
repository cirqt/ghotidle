from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication without CSRF check for CORS requests.
    Use this for API endpoints that need session auth but are called from a different origin.
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF check
