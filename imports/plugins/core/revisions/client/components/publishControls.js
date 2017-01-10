import React, { Component, PropTypes } from "react";
import {
  Button,
  ButtonToolbar,
  Divider,
  DropDownMenu,
  Menu,
  MenuItem,
  Popover,
  Translation,

  Toolbar,
  ToolbarGroup,
  Switch

} from "/imports/plugins/core/ui/client/components";
import SimpleDiff from "./simpleDiff";
import { Translatable } from "/imports/plugins/core/ui/client/providers";

/** TMP **/
import { Reaction } from "/client/api";

class PublishControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDiffs: false
    };

    this.handleToggleShowChanges = this.handleToggleShowChanges.bind(this);
    this.handlePublishClick = this.handlePublishClick.bind(this);
  }

  handleToggleShowChanges() {
    this.setState({
      showDiffs: !this.state.showDiffs
    });
  }

  handlePublishClick() {
    if (this.props.onPublishClick) {
      this.props.onPublishClick(this.props.revisions);
    }
  }

  handleVisibilityChange = (event, value) => {
    if (this.props.onVisibilityChange) {
      let isDocumentVisible = false;

      if (value === "public") {
        isDocumentVisible = true;
      }

      this.props.onVisibilityChange(event, isDocumentVisible);
    }
  }

  handleAction = (event, value) => {
    if (this.props.onAction) {
      this.props.onAction(event, value, this.props.documentIds);
    }
  }

  get showChangesButtonLabel() {
    if (!this.showDiffs) {
      return "Show Changes";
    }

    return "Hide Changes";
  }

  get showChangesButtoni18nKeyLabel() {
    if (!this.showDiffs) {
      return "app.showChanges";
    }

    return "app.hideChanges";
  }

  get revisionIds() {
    if (this.hasRevisions) {
      return this.props.revisions.map(revision => revision._id);
    }
    return false;
  }

  get hasRevisions() {
    return Array.isArray(this.props.revisions) && this.props.revisions.length;
  }

  get diffs() {
    return this.props.revisions;
  }

  get showDiffs() {
    return this.diffs && this.state.showDiffs;
  }

  get isVisible() {
    if (Array.isArray(this.props.revisions) && this.props.revisions.length) {
      const primaryRevision = this.props.revisions[0];

      if (primaryRevision.documentData.isVisible) {
        return "public";
      }
    } else if (Array.isArray(this.props.documents) && this.props.documents.length) {
      const primaryDocument = this.props.documents[0];

      if (primaryDocument.isVisible) {
        return "public";
      }
    }

    return "private";
  }

  /**
   * Getter hasChanges
   * @return {Boolean} one or more revision has changes
   */
  get hasChanges() {
    // Verify we even have any revision at all
    if (this.hasRevisions) {
      // Loop through all revisions to determine if they have changes
      const diffHasActualChanges = this.props.revisions.map((revision) => {
        // We probably do have chnages to publish
        // Note: Sometimes "updatedAt" will cause false positives, but just incase, lets
        // enable the publish button anyway.
        if (Array.isArray(revision.diff) && revision.diff.length || revision.documentType !== "product") {
          return true;
        }

        // If all else fails, we will disable the button
        return false;
      });

      // If even one revision has changes we should enable the publish button
      return diffHasActualChanges.some((element) => {
        return element === true;
      });
    }

    // No revisions, no publishing
    return false;
  }

  renderChanges() {
    if (this.showDiffs) {
      const diffs = this.props.revisions.map((revision) => {
        return <SimpleDiff diff={revision.diff} key={revision._id} />;
      });

      return (
        <div>
          {diffs}
        </div>
      );
    }
    return null;
  }

  renderDeletionStatus() {
    if (this.hasChanges) {
      if (this.props.revisions[0].documentData.isDeleted) {
        return (
          <Button
            label="Archived"
            onClick={this.handleRestore}
            status="danger"
            i18nKeyLabel="app.archived"
          />
        );
      }
    }

    return null;
  }

  renderPublishButton() {
    return (
      <Popover
        buttonElement={
          <Button
            disabled={this.hasChanges === false}
            label="Publish Changes"
            onClick={this.handlePublishClick}
            status="success"
            tooltip={"This product has changes that need to be published before they are visible to your customers."}
            i18nKeyLabel="app.publishChanges"
          />
        }
        showDropdownButton={true}
      >
        <Menu onChange={this.handleAction}>
          <MenuItem
            disabled={this.hasChanges === false}
            i18nKeyLabel="revisions.discardChanges"
            icon="fa fa-undo"
            label="Discard Changes"
            value="discard"
          />
          <Divider />
          <MenuItem
            i18nKeyLabel="app.archive"
            icon="fa fa-trash-o"
            label="Archive"
            value="archive"
          />
        </Menu>
      </Popover>
    );
  }

  renderViewControls() {
    if (this.props.showViewAsControls) {
      return (
        <Button
          label="Private"
          i18nKeyLabel="app.private"
          i18nKeyToggleOnLabel="app.public"
          toggleOnLabel="Public"
          icon="fa fa-eye-slash"
          onIcon="fa fa-eye"
          toggle={true}
          value="public"
          onValue="private"
          toggleOn={this.isVisible === "public"}
          onToggle={this.handleVisibilityChange}
        />
      );
      // return (
      //   <DropDownMenu
      //     onChange={this.handleVisibilityChange}
      //     value={this.isVisible}
      //   >
      //     <MenuItem
      //       i18nKeyLabel="app.public"
      //       icon="fa fa-unlock"
      //       label="Public"
      //       selectLabel="Public"
      //       value="public"
      //     />
      //     <MenuItem
      //       i18nKeyLabel="app.private"
      //       label="Private"
      //       icon="fa fa-lock"
      //       selectLabel="Public"
      //       value="private"
      //     />
      //   </DropDownMenu>
      // );
    }

    return null;
  }

  renderUndoButton() {
    return (
      <Button
        disabled={this.hasChanges === false}
        tooltip="Discard Changes"
        i18nKeyTooltip="revisions.discardChanges"
        icon={"fa fa-undo"}
        value="discard"
        onClick={this.handleAction}
      />
    );
  }

  renderArchiveButton() {
    return (
      <Button
        tooltip="Archive"
        i18nKeyTooltip="app.archive"
        icon={"fa fa-archive"}
        value="archive"
        onClick={this.handleAction}
      />
    );
  }

  renderSettingsButton() {
    return (
      <Button
        icon={"fa fa-cog"}
        value="settings"
        onClick={this.handleAction}
      />
    );
  }

  renderVisibilitySwitch() {
    /*
    <DropDownMenu
      buttonElement={<Button label="Switch" />}
      onChange={this.props.onViewContextChange}
      value={this.props.viewAs}
    >
      <MenuItem label="Administrator" value="administrator" />
      <MenuItem label="Customer" value="customer" />
    </DropDownMenu>
     */
    return (
      <Switch
        i18nKeyLabel={"app."}
        label={"Preview"}
      />
    );
  }

  /** TMP **/
  renderAdminButton() {
    return (
      <Button
        icon={"fa fa-arrow-right"}
        onClick={() => {
          Reaction.showActionView({
            i18nKeyTite: "dashboard.coreTitle",
            title: "Dashboard",
            template: "dashboardPackages"
          });
        }}
      />
    );
  }
  renderVerticalDivider() {
    return (
      <div style={{
        height: "20px",
        width: 1,
        backgroundColor: "#E6E6E6",
        margin: "0 10px"
      }}
      />
    );
  }

  render() {
    if (this.props.isEnabled) {
      return (
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            {this.renderViewControls()}
            {this.renderVisibilitySwitch()}
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            {this.renderDeletionStatus()}
            {this.renderUndoButton()}
            {this.renderArchiveButton()}
            {this.renderSettingsButton()}

            {this.renderVerticalDivider()}
            {this.renderPublishButton()}
            {this.renderVerticalDivider()}

            {this.renderAdminButton()}
          </ToolbarGroup>
        </Toolbar>
      );
    }

    return (
      <div className="rui publish-controls">
        <Translation
          defaultValue="Revision control is disabled. Any changes will be published immediately."
          i18nKey="revisions.isDisabled"
        />
      </div>
    );
  }
}

PublishControls.propTypes = {
  documentIds: PropTypes.arrayOf(PropTypes.string),
  documents: PropTypes.arrayOf(PropTypes.object),
  isEnabled: PropTypes.bool,
  onAction: PropTypes.func,
  onPublishClick: PropTypes.func,
  onVisibilityChange: PropTypes.func,
  revisions: PropTypes.arrayOf(PropTypes.object),
  showViewAsControls: PropTypes.bool,
  translation: PropTypes.shape({
    lang: PropTypes.string
  })
};

PublishControls.defaultProps = {
  showViewAsControls: true
};

export default Translatable()(PublishControls);
