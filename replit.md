# Overview

The Sorting Visualizer is an interactive educational web application built with Flask (Python backend) and vanilla JavaScript frontend. It provides two main modes: Learn Mode for step-by-step algorithm education and Game Mode for competitive algorithm racing. The application visualizes sorting algorithms (Bubble, Insertion, Selection, Merge, Quick, Heap) with customizable themes and tracks performance statistics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Flask Web Framework**: Single-file Flask application (`app.py`) with modular route handling
- **SQLAlchemy ORM**: Database abstraction layer using Flask-SQLAlchemy with declarative base model
- **Model Layer**: Two main models - `SortingSession` for tracking individual sorting runs and `AlgorithmStats` for aggregate performance data
- **Algorithm Engine**: Dedicated `sorting_algorithms.py` module containing implementations of six sorting algorithms with step-by-step tracking capabilities
- **RESTful API Design**: JSON endpoints for array generation, sorting operations, and algorithm information retrieval

## Frontend Architecture
- **Multi-file JavaScript Architecture**: Modular JS structure with separate files for main functionality, algorithms, themes, and visualization
- **Canvas-based Visualization**: HTML5 Canvas for real-time sorting animations with customizable themes (bars, circles, cards)
- **Bootstrap UI Framework**: Responsive design using Bootstrap 5 with custom CSS theming
- **Template System**: Jinja2 templating with base template inheritance for consistent UI structure

## Data Storage
- **SQLite Database**: Default local database with configurable DATABASE_URL for production deployments
- **Session Tracking**: Stores algorithm performance metrics including comparisons, swaps, execution time, and mode (learn/game)
- **Statistics Aggregation**: Maintains running averages and win counts for algorithm comparison

## Key Design Patterns
- **Factory Pattern**: Algorithm selection and execution through dictionary mapping
- **Observer Pattern**: Step-by-step visualization tracking in sorting algorithms
- **Configuration Management**: Environment-based configuration for database and session management

# External Dependencies

## Backend Dependencies
- **Flask**: Core web framework for routing and request handling
- **Flask-SQLAlchemy**: Database ORM and migration management
- **SQLAlchemy**: Database abstraction layer with DeclarativeBase
- **Werkzeug ProxyFix**: Production deployment middleware for reverse proxy compatibility

## Frontend Dependencies
- **Bootstrap 5.3.0**: UI framework loaded via CDN for responsive design
- **Font Awesome 6.4.0**: Icon library via CDN for consistent iconography
- **HTML5 Canvas API**: Native browser API for visualization rendering
- **Fetch API**: Modern browser API for AJAX requests to backend endpoints

## Development Environment
- **Python Logging**: Built-in logging system for debugging and monitoring
- **Environment Variables**: Configuration management through os.environ for database URLs and session secrets
- **Local Development**: SQLite fallback with debug mode enabled