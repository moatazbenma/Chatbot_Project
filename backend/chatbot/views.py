from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

@api_view(["POST"])
def chatbot(request):
    message = request.data.get("message")


    return Response({
        "reply": f"You asked {message}"
    })