#!/usr/bin/env python3
"""
Test script for the enhanced ML service to verify improved mapping suggestions.
"""

import requests
import json

# Test data representing realistic database schemas
test_request = {
    "source_schema": [
        {
            "id": "src_1",
            "name": "customer_id",
            "dataType": "INTEGER",
            "isPrimaryKey": True,
            "isNullable": False
        },
        {
            "id": "src_2", 
            "name": "first_name",
            "dataType": "VARCHAR",
            "isPrimaryKey": False,
            "isNullable": True
        },
        {
            "id": "src_3",
            "name": "last_name", 
            "dataType": "VARCHAR",
            "isPrimaryKey": False,
            "isNullable": True
        },
        {
            "id": "src_4", 
            "name": "email",
            "dataType": "VARCHAR",
            "isPrimaryKey": False,
            "isNullable": True
        },
        {
            "id": "src_5",
            "name": "phone_number",
            "dataType": "VARCHAR", 
            "isPrimaryKey": False,
            "isNullable": True
        },
        {
            "id": "src_6",
            "name": "age",
            "dataType": "INTEGER",
            "isPrimaryKey": False,
            "isNullable": True
        }
    ],
    "destination_schema": [
        {
            "id": "dest_1",
            "name": "client_id", 
            "dataType": "INTEGER",
            "isPrimaryKey": True,
            "isNullable": False
        },
        {
            "id": "dest_2",
            "name": "full_name",
            "dataType": "VARCHAR",
            "isPrimaryKey": False,
            "isNullable": True
        },
        {
            "id": "dest_3",
            "name": "email_address",
            "dataType": "VARCHAR",
            "isPrimaryKey": False,
            "isNullable": True
        },
        {
            "id": "dest_4",
            "name": "contact_phone",
            "dataType": "VARCHAR",
            "isPrimaryKey": False,
            "isNullable": True
        },
        {
            "id": "dest_5",
            "name": "date_of_birth",
            "dataType": "DATE",
            "isPrimaryKey": False,
            "isNullable": True
        },
        {
            "id": "dest_6",
            "name": "registration_date",
            "dataType": "TIMESTAMP",
            "isPrimaryKey": False,
            "isNullable": True
        }
    ]
}

def test_ml_service():
    """Test the ML service with sample data."""
    try:
        print("Testing Enhanced ML Service...")
        print("=" * 50)
        
        # Health check first
        health_response = requests.get("http://localhost:5000/health")
        print(f"Health Check Status: {health_response.status_code}")
        print(f"Health Response: {health_response.json()}")
        print()
        
        # Test predictions
        response = requests.post(
            "http://localhost:5000/predict-mappings",
            json=test_request,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Prediction Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            predictions = data.get("predictions", [])
            
            print(f"Number of predictions: {len(predictions)}")
            print("\nMapping Suggestions:")
            print("-" * 80)
            
            for i, pred in enumerate(predictions, 1):
                src_col = next(col for col in test_request["source_schema"] 
                             if col["id"] == pred["source_column_id"])
                dest_col = next(col for col in test_request["destination_schema"] 
                              if col["id"] == pred["destination_column_id"])
                
                print(f"{i}. {src_col['name']} -> {dest_col['name']}")
                print(f"   Confidence: {pred['confidence']:.3f}")
                print(f"   Type: {pred['suggested_type']}")
                print(f"   Reason: {pred['reason']}")
                print()
                
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to ML service. Make sure it's running on localhost:5000")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_ml_service()
