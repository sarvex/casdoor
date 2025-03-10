// Copyright 2021 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import {Button, Card, Col, Input, Row, Select, Switch} from 'antd';
import * as RoleBackend from "./backend/RoleBackend";
import * as OrganizationBackend from "./backend/OrganizationBackend";
import * as UserBackend from "./backend/UserBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

const { Option } = Select;

class RoleEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      organizationName: props.organizationName !== undefined ? props.organizationName : props.match.params.organizationName,
      roleName: props.match.params.roleName,
      role: null,
      organizations: [],
      users: [],
      roles: [],
    };
  }

  UNSAFE_componentWillMount() {
    this.getRole();
    this.getOrganizations();
  }

  getRole() {
    RoleBackend.getRole(this.state.organizationName, this.state.roleName)
      .then((role) => {
        this.setState({
          role: role,
        });

        this.getUsers(role.owner);
        this.getRoles(role.owner);
      });
  }

  getOrganizations() {
    OrganizationBackend.getOrganizations("admin")
      .then((res) => {
        this.setState({
          organizations: (res.msg === undefined) ? res : [],
        });
      });
  }

  getUsers(organizationName) {
    UserBackend.getUsers(organizationName)
      .then((res) => {
        this.setState({
          users: res,
        });
      });
  }

  getRoles(organizationName) {
    RoleBackend.getRoles(organizationName)
      .then((res) => {
        this.setState({
          roles: res,
        });
      });
  }

  parseRoleField(key, value) {
    if ([""].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateRoleField(key, value) {
    value = this.parseRoleField(key, value);

    let role = this.state.role;
    role[key] = value;
    this.setState({
      role: role,
    });
  }

  renderRole() {
    return (
      <Card size="small" title={
        <div>
          {i18next.t("role:Edit Role")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitRoleEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: '20px'}} type="primary" onClick={() => this.submitRoleEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
        </div>
      } style={(Setting.isMobile())? {margin: '5px'}:{}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: '100%'}} value={this.state.role.owner} onChange={(value => {this.updateRoleField('owner', value);})}>
              {
                this.state.organizations.map((organization, index) => <Option key={index} value={organization.name}>{organization.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.role.name} onChange={e => {
              this.updateRoleField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Display name"), i18next.t("general:Display name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.role.displayName} onChange={e => {
              this.updateRoleField('displayName', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("role:Sub users"), i18next.t("role:Sub users - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} mode="tags" style={{width: '100%'}} value={this.state.role.users} onChange={(value => {this.updateRoleField('users', value);})}>
              {
                this.state.users.map((user, index) => <Option key={index} value={`${user.owner}/${user.name}`}>{`${user.owner}/${user.name}`}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("role:Sub roles"), i18next.t("role:Sub roles - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} mode="tags" style={{width: '100%'}} value={this.state.role.roles} onChange={(value => {this.updateRoleField('roles', value);})}>
              {
                this.state.roles.filter(role => (role.owner !== this.state.role.owner || role.name !== this.state.role.name)).map((role, index) => <Option key={index} value={`${role.owner}/${role.name}`}>{`${role.owner}/${role.name}`}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 19 : 2}>
            {Setting.getLabel(i18next.t("general:Is enabled"), i18next.t("general:Is enabled - Tooltip"))} :
          </Col>
          <Col span={1} >
            <Switch checked={this.state.role.isEnabled} onChange={checked => {
              this.updateRoleField('isEnabled', checked);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitRoleEdit(willExist) {
    let role = Setting.deepCopy(this.state.role);
    RoleBackend.updateRole(this.state.organizationName, this.state.roleName, role)
      .then((res) => {
        if (res.msg === "") {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            roleName: this.state.role.name,
          });

          if (willExist) {
            this.props.history.push(`/roles`);
          } else {
            this.props.history.push(`/roles/${this.state.role.owner}/${this.state.role.name}`);
          }
        } else {
          Setting.showMessage("error", res.msg);
          this.updateRoleField('name', this.state.roleName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `Failed to connect to server: ${error}`);
      });
  }

  render() {
    return (
      <div>
        {
          this.state.role !== null ? this.renderRole() : null
        }
        <div style={{marginTop: '20px', marginLeft: '40px'}}>
          <Button size="large" onClick={() => this.submitRoleEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: '20px'}} type="primary" size="large" onClick={() => this.submitRoleEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
        </div>
      </div>
    );
  }
}

export default RoleEditPage;
