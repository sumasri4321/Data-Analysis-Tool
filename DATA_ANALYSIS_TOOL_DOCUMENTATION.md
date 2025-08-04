# Data Analysis Tool - Complete Setup and Deployment Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Running the Application](#running-the-application)
4. [Troubleshooting](#troubleshooting)
5. [Architecture Overview](#architecture-overview)

---

## Project Overview

The Data Analysis Tool is a comprehensive data migration and analysis platform built with modern technologies:

- **Frontend**: Angular 18 with Tailwind CSS and Bootstrap
- **Backend**: Spring Boot (Java)
- **Database**: PostgreSQL (Source and Destination)
- **ML Service**: Python service running on port 5000
- **Authentication**: Azure AD integration
- **Development Tools**: VS Code (Angular), IntelliJ IDEA (Spring Boot)

---

## Infrastructure Setup

### Prerequisites
Before starting, ensure you have administrative rights on your Windows machine.

### 1. Node.js and npm Installation

#### Step 1.1: Download and Install Node.js
1. Visit [Node.js official website](https://nodejs.org/)
2. Download the **LTS version** (recommended for production)
3. Run the installer (.msi file)
4. Follow the installation wizard:
   - Accept the license agreement
   - Choose installation directory (default: `C:\Program Files\nodejs\`)
   - Select "Add to PATH" option
   - Click "Install"

#### Step 1.2: Verify Installation
1. Open **Command Prompt** or **PowerShell** as Administrator
2. Run the following commands:
   ```powershell
   node --version
   npm --version
   ```
3. You should see version numbers (e.g., v20.x.x for Node.js and 10.x.x for npm)

### 2. Angular CLI Installation

#### Step 2.1: Install Angular CLI Globally
1. Open **Command Prompt** or **PowerShell** as Administrator
2. Run:
   ```powershell
   npm install -g @angular/cli@18.2.20
   ```
3. Verify installation:
   ```powershell
   ng version
   ```

### 3. Visual Studio Code Setup

#### Step 3.1: Download and Install VS Code
1. Visit [Visual Studio Code website](https://code.visualstudio.com/)
2. Download VS Code for Windows
3. Run the installer
4. Follow installation wizard:
   - Accept license agreement
   - Choose installation location
   - Select additional tasks:
     - ☑️ Add "Open with Code" action to Windows Explorer file context menu
     - ☑️ Add "Open with Code" action to Windows Explorer directory context menu
     - ☑️ Add to PATH
   - Click "Install"

#### Step 3.2: Install Required VS Code Extensions
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Install the following extensions:
   - **Angular Language Service** (by Angular)
   - **TypeScript Hero** (by rbbit)
   - **Prettier - Code formatter** (by Prettier)
   - **Auto Rename Tag** (by Jun Han)
   - **Bracket Pair Colorizer** (by CoenraadS)
   - **GitLens** (by GitKraken)
   - **Live Server** (by Ritwick Dey)

### 4. Java Development Kit (JDK) Installation

#### Step 4.1: Download and Install JDK
1. Visit [Oracle JDK website](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
2. Download **JDK 17** or **JDK 21** (LTS versions)
3. Run the installer
4. Follow installation wizard (default installation path: `C:\Program Files\Java\jdk-xx`)

#### Step 4.2: Set JAVA_HOME Environment Variable
1. Right-click "This PC" → Properties
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System Variables", click "New"
5. Variable name: `JAVA_HOME`
6. Variable value: `C:\Program Files\Java\jdk-xx` (replace xx with your version)
7. Click "OK"

#### Step 4.3: Update PATH Variable
1. In Environment Variables, find "Path" under System Variables
2. Click "Edit"
3. Click "New"
4. Add: `%JAVA_HOME%\bin`
5. Click "OK" on all dialogs

#### Step 4.4: Verify Installation
1. Open new Command Prompt
2. Run:
   ```powershell
   java -version
   javac -version
   ```

### 5. IntelliJ IDEA Installation

#### Step 5.1: Download and Install IntelliJ IDEA
1. Visit [JetBrains IntelliJ IDEA website](https://www.jetbrains.com/idea/)
2. Download **Community Edition** (free) or **Ultimate Edition**
3. Run the installer
4. Follow installation wizard:
   - Choose installation directory
   - Select options:
     - ☑️ Create Desktop Shortcut
     - ☑️ Update PATH variable
     - ☑️ Add "Open Folder as IntelliJ IDEA Project"
     - ☑️ .java association
   - Click "Install"

#### Step 5.2: Configure IntelliJ for Spring Boot
1. Open IntelliJ IDEA
2. Install required plugins:
   - Go to File → Settings → Plugins
   - Search and install:
     - **Spring Boot** (usually pre-installed in Ultimate)
     - **Spring** (usually pre-installed in Ultimate)
     - **Maven** (usually pre-installed)
     - **Gradle** (if using Gradle)

### 6. PostgreSQL Installation

#### Step 6.1: Download and Install PostgreSQL
1. Visit [PostgreSQL official website](https://www.postgresql.org/download/windows/)
2. Download PostgreSQL installer for Windows
3. Run the installer
4. Follow installation wizard:
   - Choose installation directory (default: `C:\Program Files\PostgreSQL\xx`)
   - Select components:
     - ☑️ PostgreSQL Server
     - ☑️ pgAdmin 4
     - ☑️ Stack Builder
     - ☑️ Command Line Tools
   - Set data directory (default: `C:\Program Files\PostgreSQL\xx\data`)
   - Set superuser password (remember this password!)
   - Set port number (default: 5432)
   - Set locale (default: system locale)
   - Click "Install"

#### Step 6.2: Verify PostgreSQL Installation
1. Open **Command Prompt** as Administrator
2. Navigate to PostgreSQL bin directory:
   ```powershell
   cd "C:\Program Files\PostgreSQL\xx\bin"
   ```
3. Test connection:
   ```powershell
   psql -U postgres -h localhost
   ```
4. Enter the password you set during installation

#### Step 6.3: Create Source and Destination Databases
1. Open **pgAdmin 4** from Start Menu
2. Connect to PostgreSQL server (enter password)
3. Right-click "Databases" → Create → Database
4. Create two databases:
   - Name: `source_database`
   - Name: `destination_database`
5. Click "Save"

### 7. Python and ML Service Setup

#### Step 7.1: Install Python
1. Visit [Python official website](https://www.python.org/downloads/)
2. Download **Python 3.11** or **Python 3.12**
3. Run the installer
4. **IMPORTANT**: Check "Add Python to PATH" during installation
5. Choose "Customize installation"
6. Select all optional features
7. In Advanced Options:
   - ☑️ Install for all users
   - ☑️ Add Python to environment variables
   - ☑️ Precompile standard library
8. Click "Install"

#### Step 7.2: Verify Python Installation
1. Open Command Prompt
2. Run:
   ```powershell
   python --version
   pip --version
   ```

#### Step 7.3: Install Required Python Libraries
1. Open Command Prompt as Administrator
2. Install common ML libraries:
   ```powershell
   pip install flask
   pip install pandas
   pip install numpy
   pip install scikit-learn
   pip install matplotlib
   pip install seaborn
   pip install requests
   pip install psycopg2-binary
   pip install sqlalchemy
   pip install flask-cors
   ```

### 8. Azure Portal Configuration

#### Step 8.1: Create Azure Account
1. Visit [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account or create new account
3. If using corporate account, contact your Azure administrator

#### Step 8.2: Register Application in Azure AD
1. In Azure Portal, search for "Azure Active Directory"
2. Click on "App registrations"
3. Click "New registration"
4. Fill in application details:
   - **Name**: Data Analysis Tool
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: 
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:4200`
5. Click "Register"

#### Step 8.3: Configure Application Settings
1. In your registered app, go to "Authentication"
2. Under "Implicit grant and hybrid flows":
   - ☑️ Access tokens
   - ☑️ ID tokens
3. Go to "API permissions"
4. Add required permissions (User.Read is usually sufficient)
5. Note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**

---

## Running the Application

### 1. Setup Angular Frontend

#### Step 1.1: Navigate to Project Directory
1. Open **VS Code**
2. Open folder: `C:\Users\s2p9x3\OneDrive - Swiss Reinsurance Company Ltd\Data Analysis Tool Final\data-migration-ui-styled - July 23rd`

#### Step 1.2: Install Dependencies
1. Open Terminal in VS Code (Ctrl + `)
2. Run:
   ```powershell
   npm install
   ```

#### Step 1.3: Configure Azure AD Settings
1. Open `src/app/app.config.ts`
2. Update the configuration with your Azure AD details:
   ```typescript
   // Update with your Azure AD configuration
   clientId: 'your-application-client-id',
   authority: 'https://login.microsoftonline.com/your-tenant-id'
   ```

#### Step 1.4: Start Angular Development Server
1. In VS Code terminal, run:
   ```powershell
   npm start
   ```
2. Application will be available at: `http://localhost:4200`
3. **Keep this terminal open** - the server needs to keep running

### 2. Setup Spring Boot Backend

#### Step 2.1: Open Spring Boot Project in IntelliJ
1. Open **IntelliJ IDEA**
2. Click "Open" and navigate to your Spring Boot project directory
3. Wait for IntelliJ to index the project and download dependencies

#### Step 2.2: Configure Database Connection
1. Open `application.properties` or `application.yml`
2. Configure PostgreSQL connection:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/source_database
   spring.datasource.username=postgres
   spring.datasource.password=your_postgres_password
   spring.datasource.driver-class-name=org.postgresql.Driver
   
   # For destination database (if needed)
   destination.datasource.url=jdbc:postgresql://localhost:5432/destination_database
   destination.datasource.username=postgres
   destination.datasource.password=your_postgres_password
   ```

#### Step 2.3: Run Spring Boot Application
1. In IntelliJ, locate the main application class (usually `*Application.java`)
2. Right-click on the file
3. Select "Run 'Application.main()'"
4. Or click the green play button next to the main method
5. **Keep IntelliJ open** - the backend server needs to keep running
6. Backend will typically run on: `http://localhost:8080`

### 3. Start PostgreSQL Database

#### Step 3.1: Start PostgreSQL Service
1. Open **Command Prompt** as Administrator
2. Start PostgreSQL service:
   ```powershell
   net start postgresql-x64-xx
   ```
   (Replace xx with your PostgreSQL version)

#### Step 3.2: Verify Database Connection
1. Open **pgAdmin 4**
2. Connect to your PostgreSQL server
3. Ensure both `source_database` and `destination_database` are accessible

### 4. Start ML Service

#### Step 4.1: Navigate to ML Service Directory
1. Open **Command Prompt**
2. Navigate to your ML service directory:
   ```powershell
   cd "path\to\your\ml\service"
   ```

#### Step 4.2: Create ML Service Script (if not exists)
Create a basic Flask ML service (`ml_service.py`):
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "ML Service"})

@app.route('/analyze', methods=['POST'])
def analyze_data():
    try:
        data = request.json
        # Add your ML analysis logic here
        result = {"analysis": "completed", "data": data}
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

#### Step 4.3: Run ML Service
1. In Command Prompt, run:
   ```powershell
   python ml_service.py
   ```
2. **Keep this command prompt open**
3. ML service will be available at: `http://localhost:5000`

### 5. Complete Startup Sequence

#### Order of Starting Services:
1. **PostgreSQL** (Start first)
   ```powershell
   net start postgresql-x64-xx
   ```

2. **ML Service** (Start second)
   ```powershell
   cd "path\to\ml\service"
   python ml_service.py
   ```

3. **Spring Boot Backend** (Start third)
   - Run from IntelliJ IDEA

4. **Angular Frontend** (Start last)
   ```powershell
   npm start
   ```

#### Verification URLs:
- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:8080
- **ML Service**: http://localhost:5000/health
- **Database**: Connect via pgAdmin 4

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Node.js/npm Issues
**Problem**: `npm` command not recognized
**Solution**: 
- Restart Command Prompt after Node.js installation
- Add Node.js to PATH manually if needed

#### 2. Angular CLI Issues
**Problem**: `ng` command not recognized
**Solution**:
```powershell
npm install -g @angular/cli
```

#### 3. Java Issues
**Problem**: `java` command not recognized
**Solution**:
- Verify JAVA_HOME is set correctly
- Ensure PATH includes `%JAVA_HOME%\bin`

#### 4. PostgreSQL Connection Issues
**Problem**: Cannot connect to PostgreSQL
**Solution**:
- Verify PostgreSQL service is running
- Check password and port (default: 5432)
- Ensure Windows Firewall allows PostgreSQL

#### 5. Python/ML Service Issues
**Problem**: Python libraries not found
**Solution**:
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

#### 6. Azure AD Authentication Issues
**Problem**: Authentication fails
**Solution**:
- Verify client ID and tenant ID in configuration
- Check redirect URI matches exactly
- Ensure proper permissions granted in Azure Portal

#### 7. Port Conflicts
**Problem**: Port already in use
**Solutions**:
- Angular (4200): Add `--port 4201` to ng serve
- Spring Boot: Change `server.port` in application.properties
- ML Service: Change port in Python script

---

## Architecture Overview

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular UI    │    │   Spring Boot    │    │   PostgreSQL    │
│   (Port 4200)   │◄──►│   (Port 8080)    │◄──►│   (Port 5432)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └─────────────►│   ML Service    │
                        │   (Port 5000)   │
                        └─────────────────┘
                                │
                        ┌─────────────────┐
                        │   Azure AD      │
                        │ Authentication  │
                        └─────────────────┘
```

### Data Flow
1. User accesses Angular frontend
2. Azure AD handles authentication
3. Frontend communicates with Spring Boot backend
4. Backend processes data migration between PostgreSQL databases
5. ML Service provides data analysis capabilities
6. Results displayed in Angular UI

### Technology Stack Summary
- **Frontend**: Angular 18, TypeScript, Tailwind CSS, Bootstrap
- **Backend**: Spring Boot, Java
- **Database**: PostgreSQL
- **ML/Analytics**: Python, Flask
- **Authentication**: Azure AD (MSAL)
- **Development**: VS Code, IntelliJ IDEA

---

## Future Enhancements

### Scalability Improvements
- **File Size Handling**: Implement chunked file upload and processing for large SQL files and datasets
- **Database Connection Pooling**: Add connection pooling for better database performance under load
- **Horizontal Scaling**: Design microservices architecture for independent scaling of components
- **Caching Layer**: Implement Redis or similar caching solutions for frequently accessed data
- **Load Balancing**: Add load balancers for distributing traffic across multiple application instances

### Machine Learning Enhancements
- **Advanced ML Models**: 
  - Implement deep learning models for more accurate data mapping predictions
  - Add support for transformer-based models for semantic understanding
  - Integrate natural language processing for better column name matching
- **Model Training Pipeline**: 
  - Create automated retraining pipelines based on user feedback
  - Implement active learning to improve model accuracy over time
  - Add model versioning and A/B testing capabilities
- **Custom Model Support**: Allow users to upload and integrate their own trained models
- **Real-time Predictions**: Implement streaming ML predictions for real-time data processing

### LLM Integration for Automated Code Generation
- **Large Language Model (LLM) Integration**:
  - **Intelligent Transformation Generation**: Replace manual Spring Boot transformation coding with AI-generated functions
  - **Natural Language to Code**: Allow users to describe transformations in plain English and automatically generate Java code
  - **Context-Aware Code Generation**: LLM analyzes source and destination schemas to generate optimal transformation logic
  - **Code Quality Assurance**: Generated code includes error handling, validation, and performance optimizations

#### LLM-Powered Transformation Workflow
1. **Schema Analysis**: LLM analyzes source and destination database schemas
2. **Pattern Recognition**: Identifies common transformation patterns from existing codebase
3. **Natural Language Input**: User describes transformation requirements in plain English
4. **Code Generation**: LLM generates complete Spring Boot transformation functions
5. **Validation & Testing**: Automated testing of generated code against sample data
6. **Integration**: Seamless deployment into existing Spring Boot backend

#### Technical Implementation
- **LLM Service Integration**:
  - **OpenAI GPT-4/Claude Integration**: RESTful API integration with enterprise LLM providers
  - **Local LLM Deployment**: Option for on-premises LLM deployment for data security
  - **Hybrid Approach**: Combine rule-based ML with LLM for enhanced accuracy
  
- **Code Generation Pipeline**:
  - **Template Library**: Pre-built transformation templates for common scenarios
  - **Code Validation**: Syntax checking and compilation verification
  - **Performance Analysis**: Generated code optimization for large datasets
  - **Security Scanning**: Automated security vulnerability detection in generated code

#### Leveraging Existing Workspace Assets for LLM Enhancement
- **`MlMappingSuggestion.java`**: Extend to interface with LLM APIs for transformation suggestions
- **`enhanced_model.py`**: Integrate LLM prompting and response processing
- **`comprehensive_final_test.py`**: Automated testing framework for LLM-generated code validation
- **`ScalableMigrationService.java`**: Base infrastructure for deploying LLM-generated transformations

#### Advanced LLM Features
- **Multi-Modal Understanding**:
  - Process SQL schemas, sample data, and business requirements simultaneously
  - Generate transformations that handle data type conversions, null handling, and business logic
  - Create comprehensive documentation for generated transformation functions

- **Iterative Refinement**:
  - User feedback loop to improve generated code quality
  - Version control for generated transformations
  - A/B testing between manual and LLM-generated transformations

- **Enterprise Integration**:
  - **Code Review Workflow**: Generated code goes through automated and manual review processes
  - **Deployment Pipeline**: Seamless integration with CI/CD for production deployment
  - **Audit Trail**: Complete logging of LLM decisions and generated code for compliance

#### Expected Benefits
- **Developer Productivity**: 80-90% reduction in manual transformation coding time
- **Code Quality**: Consistent, optimized, and well-documented transformation functions
- **Scalability**: Rapid generation of transformations for large-scale migration projects
- **Knowledge Transfer**: LLM captures and replicates expert transformation patterns
- **Reduced Errors**: Automated testing and validation minimize human coding errors

#### Implementation Phases
1. **Phase 1**: Basic LLM integration for simple column mappings and data type conversions
2. **Phase 2**: Complex business logic transformations with conditional logic
3. **Phase 3**: Advanced transformations including aggregations, joins, and data enrichment
4. **Phase 4**: Full autonomous transformation generation with minimal human oversight

### User Experience Improvements
- **Enhanced UI/UX**: 
  - Add dark mode support
  - Implement responsive design for mobile devices
  - Create guided tutorials and onboarding flows
- **Advanced Analytics Dashboard**: 
  - Real-time migration progress tracking
  - Data quality metrics and visualizations
  - Performance monitoring and alerting
- **Collaboration Features**: 
  - Multi-user workspace support
  - Version control for migration configurations
  - Team permission management

### Security & Compliance
- **Enhanced Security**: 
  - Implement role-based access control (RBAC)
  - Add audit logging for all user actions
  - Encrypt sensitive data at rest and in transit
- **Compliance Features**: 
  - GDPR compliance tools for data handling
  - Data lineage tracking
  - Automated compliance reporting

### Integration & Automation
- **API Expansion**: 
  - RESTful APIs for third-party integrations
  - Webhook support for external notifications
  - GraphQL endpoint for flexible data querying
- **CI/CD Pipeline**: 
  - Automated testing and deployment
  - Infrastructure as Code (IaC) implementation
  - Container orchestration with Kubernetes
- **Database Support**: 
  - Support for additional database types (MySQL, Oracle, MongoDB)
  - Cloud database integration (AWS RDS, Azure SQL, Google Cloud SQL)
  - NoSQL database migration capabilities

### Existing Workspace Assets for Enhancement

The workspace already contains several files and components that can be leveraged for future enhancements:

#### Frontend Enhancement Assets (Angular UI)
- **`src/app/role.guard.ts`**: Already implemented role-based route protection - can be extended for granular permissions
- **`src/app/auth/`**: Complete authentication components ready for production use
- **`src/app/components/auth-test-dev.component.ts`**: Development testing component for authentication flows
- **`src/app/guards/`**: Additional guard implementations for various access controls
- **`src/app/interceptors/`**: HTTP interceptors for request/response handling and authentication
- **`src/app/services/`**: Service layer architecture already established for backend communication
- **`src/app/models/`**: TypeScript interfaces and models for data structure consistency
- **`tailwind.config.js` & `postcss.config.js`**: Pre-configured styling framework for UI enhancements

#### Backend Enhancement Assets (Spring Boot)
- **`ScalableMigrationService.java`**: Scalable migration service implementation ready for horizontal scaling
- **`ScalableSqlQueryTracker.java`**: SQL query tracking and monitoring capabilities
- **`MlMappingSuggestion.java`**: ML integration point for mapping suggestions
- **`application-scalable.properties`**: Configuration for scalable deployment scenarios
- **`uploaded_sql_files/`**: File upload infrastructure already in place for handling large files
- **`data/connectionprofilesdb.*`**: Database connection profile management system
- **`data/mock_database_data.json`**: Mock data infrastructure for testing and development

#### ML Service Enhancement Assets (Python)
- **`column_mapper_model.pkl`**: Pre-trained column mapping model ready for production
- **`label_encoder.pkl`**: Trained label encoder for data preprocessing
- **`enhanced_model.py`**: Enhanced ML model implementation with advanced features
- **`large_dataset_trainer.py`**: Training pipeline designed for large datasets
- **`robust_dataset_trainer.py`**: Robust training implementation with error handling
- **`comprehensive_final_test.py`**: Complete testing suite for ML functionality
- **`test_business_validation.py`**: Business logic validation testing
- **`test_integration.py`**: Integration testing between ML service and backend
- **`demonstrate_comprehensive_mappings.py`**: Demo script showcasing ML capabilities

#### Ready-to-Use Infrastructure
- **Authentication Flow**: Complete Azure AD integration with role-based access
- **File Upload System**: Robust file handling with progress tracking
- **ML Pipeline**: End-to-end machine learning workflow from training to prediction
- **Database Abstraction**: Connection profile management for multiple database types
- **Testing Framework**: Comprehensive test suite covering unit, integration, and business validation


---

## Notes
- Keep all services running during development
- Use different terminal/command prompt windows for each service
- Monitor logs for any errors or issues
- Regularly backup your databases before testing data migration
- Ensure all services can communicate with each other (check firewalls)

---

*This documentation covers the complete setup and deployment of the Data Analysis Tool. For any additional questions or issues, refer to the troubleshooting section or consult the respective technology documentation.*
