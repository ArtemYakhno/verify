import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { useRouteMatch } from "./useRouteMatch";


function wrapper(path: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  );
}

function render(path: string) {
  return renderHook(() => useRouteMatch(), { wrapper: wrapper(path) }).result
    .current;
}


describe("useRouteMatch", () => {

  it("matches /galleries", () => {
    const result = render("/galleries");

    expect(result.isGalleries).toBe(true);
    expect(result.isCreateGallery).toBe(false);
    expect(result.isGalleryDetail).toBe(false);
  });

  it("matches /galleries/create", () => {
    const result = render("/galleries/create");

    expect(result.isCreateGallery).toBe(true);
    expect(result.isGalleries).toBe(false);
  });

  it("matches /profile", () => {
    const result = render("/profile");

    expect(result.isProfile).toBe(true);
  });

  it("matches /user-management", () => {
    const result = render("/user-management");

    expect(result.isUserManagment).toBe(true);
  });


  it("matches /galleries/:id with valid numeric id", () => {
    const result = render("/galleries/42");

    expect(result.isGalleryDetail).toBe(true);
    expect(result.galleryDetailId).toBe(42);
  });

  it("does not match /galleries/:id with non-numeric id", () => {
    const result = render("/galleries/abc");

    expect(result.isGalleryDetail).toBe(false);
    expect(result.galleryDetailId).toBeUndefined();
  });


  it("matches /galleries/:id/edit with valid numeric id", () => {
    const result = render("/galleries/42/edit");

    expect(result.isEditGallery).toBe(true);
    expect(result.galleryEditId).toBe(42);
  });

  it("does not match /galleries/:id/edit with non-numeric id", () => {
    const result = render("/galleries/abc/edit");

    expect(result.isEditGallery).toBe(false);
    expect(result.galleryEditId).toBeUndefined();
  });


  it("matches /galleries/:id/edit/upload with valid numeric id", () => {
    const result = render("/galleries/42/edit/upload");

    expect(result.isUploadGallery).toBe(true);
    expect(result.galleryUploadId).toBe(42);
  });

  it("does not match /galleries/:id/edit/upload with non-numeric id", () => {
    const result = render("/galleries/abc/edit/upload");

    expect(result.isUploadGallery).toBe(false);
    expect(result.galleryUploadId).toBeUndefined();
  });


  it("returns undefined for id=0 (falsy numeric)", () => {
    const result = render("/galleries/0/edit");

    expect(result.galleryEditId).toBeUndefined();
    expect(result.isEditGallery).toBe(false);
  });

  it("returns undefined for NaN id", () => {
    const result = render("/galleries/NaN/edit");

    expect(result.galleryEditId).toBeUndefined();
  });


  it("edit route does not activate detail flags", () => {
    const result = render("/galleries/42/edit");

    expect(result.isEditGallery).toBe(true);
    expect(result.isGalleryDetail).toBe(false);
    expect(result.isUploadGallery).toBe(false);
  });

  it("upload route does not activate edit or detail flags", () => {
    const result = render("/galleries/42/edit/upload");

    expect(result.isUploadGallery).toBe(true);
    expect(result.isEditGallery).toBe(false);
    expect(result.isGalleryDetail).toBe(false);
  });


  it("returns all false for unknown path", () => {
    const result = render("/some/unknown/path");

    expect(result.isGalleries).toBe(false);
    expect(result.isCreateGallery).toBe(false);
    expect(result.isGalleryDetail).toBe(false);
    expect(result.isEditGallery).toBe(false);
    expect(result.isUploadGallery).toBe(false);
    expect(result.isProfile).toBe(false);
    expect(result.isUserManagment).toBe(false);
  });

});