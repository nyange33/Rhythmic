package utils

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// AudioConverter handles audio file conversions
type AudioConverter struct {
	ffmpegPath string
}

// NewAudioConverter creates a new audio converter
func NewAudioConverter() *AudioConverter {
	ffmpegPath := "ffmpeg" // Assumes ffmpeg is in PATH
	return &AudioConverter{ffmpegPath: ffmpegPath}
}

// ConvertToMP3 converts an audio file to MP3 format
// Input file path and output file path must be provided
func (ac *AudioConverter) ConvertToMP3(inputPath, outputPath string) error {
	// Check if input file exists
	if _, err := os.Stat(inputPath); os.IsNotExist(err) {
		return fmt.Errorf("input file does not exist: %s", inputPath)
	}

	// Ensure output directory exists
	outputDir := filepath.Dir(outputPath)
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	// Build ffmpeg command
	args := []string{
		"-i", inputPath,
		"-codec:a", "libmp3lame",
		"-b:a", "192k", // 192 kbps bitrate
		"-y",          // Overwrite output file if exists
		outputPath,
	}

	cmd := exec.Command(ac.ffmpegPath, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg conversion failed: %w, output: %s", err, string(output))
	}

	return nil
}

// ConvertToMP3FromBytes converts audio data from bytes to MP3
// Returns the MP3 file as bytes
func (ac *AudioConverter) ConvertToMP3FromBytes(inputData []byte, format string) ([]byte, error) {
	// Create temporary input file
	tempInput := filepath.Join(os.TempDir(), fmt.Sprintf("input_%d.%s", getCurrentTimestamp(), format))
	if err := os.WriteFile(tempInput, inputData, 0644); err != nil {
		return nil, fmt.Errorf("failed to write temp input file: %w", err)
	}
	defer os.Remove(tempInput)

	// Create temporary output file
	tempOutput := filepath.Join(os.TempDir(), fmt.Sprintf("output_%d.mp3", getCurrentTimestamp()))
	defer os.Remove(tempOutput)

	// Convert
	if err := ac.ConvertToMP3(tempInput, tempOutput); err != nil {
		return nil, err
	}

	// Read output
	outputData, err := os.ReadFile(tempOutput)
	if err != nil {
		return nil, fmt.Errorf("failed to read output file: %w", err)
	}

	return outputData, nil
}

// GetAudioFormat detects the audio format from file extension
func GetAudioFormat(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	// Remove the dot
	if len(ext) > 0 {
		return ext[1:]
	}
	return ""
}

// ValidateAudioFile checks if the file is a valid audio file
func ValidateAudioFile(filename string) bool {
	validFormats := map[string]bool{
		"mp3":  true,
		"wav":  true,
		"flac": true,
		"aac":  true,
		"m4a":  true,
		"ogg":  true,
		"wma":  true,
	}

	format := GetAudioFormat(filename)
	return validFormats[format]
}

func getCurrentTimestamp() int64 {
	return time.Now().Unix()
}
