import { describe, it, expect, beforeEach } from "vitest";
import {
  useSuccessModalStore,
  openSuccessModal,
  closeSuccessModal,
} from "../success-modal.store";


beforeEach(() => {
  useSuccessModalStore.setState({
    isOpen: false,
    title: "",
    description: "",
  });
});

describe("successModalStore", () => {

  describe("initial state", () => {
    it("isOpen is false", () => {
      expect(useSuccessModalStore.getState().isOpen).toBe(false);
    });

    it("title is empty string", () => {
      expect(useSuccessModalStore.getState().title).toBe("");
    });

    it("description is empty string", () => {
      expect(useSuccessModalStore.getState().description).toBe("");
    });
  });

  describe("open", () => {
    it("sets isOpen to true", () => {
      useSuccessModalStore.getState().open();

      expect(useSuccessModalStore.getState().isOpen).toBe(true);
    });

    it("sets default title when no data provided", () => {
      useSuccessModalStore.getState().open();

      expect(useSuccessModalStore.getState().title).toBe("Success");
    });

    it("sets default description when no data provided", () => {
      useSuccessModalStore.getState().open();

      expect(useSuccessModalStore.getState().description).toBe(
        "Your changes were successfully saved",
      );
    });

    it("sets custom title when provided", () => {
      useSuccessModalStore.getState().open({ title: "Profile updated" });

      expect(useSuccessModalStore.getState().title).toBe("Profile updated");
    });

    it("sets custom description when provided", () => {
      useSuccessModalStore.getState().open({ description: "Your profile was saved" });

      expect(useSuccessModalStore.getState().description).toBe(
        "Your profile was saved",
      );
    });

    it("sets both custom title and description", () => {
      useSuccessModalStore.getState().open({
        title: "Done",
        description: "Operation completed",
      });

      const { title, description } = useSuccessModalStore.getState();
      expect(title).toBe("Done");
      expect(description).toBe("Operation completed");
    });

    it("uses default title when title is empty string", () => {
      useSuccessModalStore.getState().open({ title: "" });

      expect(useSuccessModalStore.getState().title).toBe("Success");
    });

    it("uses default description when description is empty string", () => {
      useSuccessModalStore.getState().open({ description: "" });

      expect(useSuccessModalStore.getState().description).toBe(
        "Your changes were successfully saved",
      );
    });
  });

  describe("close", () => {
    it("sets isOpen to false", () => {
      useSuccessModalStore.getState().open();
      useSuccessModalStore.getState().close();

      expect(useSuccessModalStore.getState().isOpen).toBe(false);
    });

    it("does not reset title after close", () => {
      useSuccessModalStore.getState().open({ title: "Done" });
      useSuccessModalStore.getState().close();

      expect(useSuccessModalStore.getState().title).toBe("Done");
    });
  });

  describe("openSuccessModal", () => {
    it("opens modal via standalone function", () => {
      openSuccessModal({ title: "Saved" });

      expect(useSuccessModalStore.getState().isOpen).toBe(true);
      expect(useSuccessModalStore.getState().title).toBe("Saved");
    });

    it("opens modal with defaults when called without args", () => {
      openSuccessModal();

      expect(useSuccessModalStore.getState().isOpen).toBe(true);
      expect(useSuccessModalStore.getState().title).toBe("Success");
    });
  });

  describe("closeSuccessModal", () => {
    it("closes modal via standalone function", () => {
      openSuccessModal();
      closeSuccessModal();

      expect(useSuccessModalStore.getState().isOpen).toBe(false);
    });
  });

});