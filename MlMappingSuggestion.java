package com.example.dynamic_migration_engine.model;

/**
 * Model representing an ML-generated mapping suggestion between source and destination columns.
 * This will be sent to the frontend as part of the metadata response.
 */
public class MlMappingSuggestion {
    private String sourceColumnName;
    private String destinationColumnName;
    private Double confidence;
    private String suggestionType;
    private String reasoning;

    public MlMappingSuggestion() {
    }

    public MlMappingSuggestion(String sourceColumnName, String destinationColumnName, Double confidence, String suggestionType, String reasoning) {
        this.sourceColumnName = sourceColumnName;
        this.destinationColumnName = destinationColumnName;
        this.confidence = confidence;
        this.suggestionType = suggestionType;
        this.reasoning = reasoning;
    }

    public String getSourceColumnName() {
        return sourceColumnName;
    }

    public void setSourceColumnName(String sourceColumnName) {
        this.sourceColumnName = sourceColumnName;
    }

    public String getDestinationColumnName() {
        return destinationColumnName;
    }

    public void setDestinationColumnName(String destinationColumnName) {
        this.destinationColumnName = destinationColumnName;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getSuggestionType() {
        return suggestionType;
    }

    public void setSuggestionType(String suggestionType) {
        this.suggestionType = suggestionType;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    @Override
    public String toString() {
        return "MlMappingSuggestion{" +
                "sourceColumnName='" + sourceColumnName + '\'' +
                ", destinationColumnName='" + destinationColumnName + '\'' +
                ", confidence=" + confidence +
                ", suggestionType='" + suggestionType + '\'' +
                ", reasoning='" + reasoning + '\'' +
                '}';
    }
}
