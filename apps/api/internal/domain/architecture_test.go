package domain_test

import (
	"go/parser"
	"go/token"
	"io/fs"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

func TestDomainAndUseCasesDoNotImportInfrastructure(t *testing.T) {
	roots := []string{".", "../usecase"}
	for _, root := range roots {
		err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if entry.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
				return nil
			}
			file, err := parser.ParseFile(token.NewFileSet(), path, nil, parser.ImportsOnly)
			if err != nil {
				return err
			}
			for _, imported := range file.Imports {
				name, err := strconv.Unquote(imported.Path.Value)
				if err != nil {
					return err
				}
				if strings.Contains(name, "gofiber") || strings.Contains(name, "jackc/pgx") {
					t.Errorf("%s imports forbidden infrastructure package %q", path, name)
				}
			}
			return nil
		})
		if err != nil {
			t.Fatalf("inspect %s: %v", root, err)
		}
	}
}
