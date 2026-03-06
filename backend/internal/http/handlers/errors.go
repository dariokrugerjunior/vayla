package handlers

import "fmt"

func errMissing(field string) error {
	return fmt.Errorf("missing field: %s", field)
}

func errInvalid(field string) error {
	return fmt.Errorf("invalid field: %s", field)
}
