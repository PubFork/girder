Installation
============

This tutorial will install a production-ready Girder on Ubuntu 18.04.

Prerequisites
-------------
Before running this, you must provide:
* A "server": an (ideally fresh) Ubuntu 18.04 system, with:
  * A ``sudo``-capable user.
  * Inbound access from the internet on TCP port 80 and 443.
  * Outbound access to the internet on UDP port 53. Many firewalls (e.g. the
    `AWS EC2 default security group <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html#default-security-group>`_)
    do not allow this by default.
  * A DNS entry, so its public IP address is resolvable from the internet.
* A "controller": a machine with
  `Ansible installed <https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html>`_
  and SSH access to the server.
* An "assetstore" for storing uploaded files on Girder. This may be either:
  * A location on the server's filesystem (which may be mounted external storage).
  * An AWS S3 bucket.
* Credentials for an outbound SMTP server, ideally with STARTTLS or TLS.
* An email address for the administrator of the system.

Configure Ansible
-----------------
All these steps should be run from a fresh directory on the controller machine.


Configure Inventory
^^^^^^^^^^^^^^^^^^^
This will...

First, create a file ``requirements.yml`` containing:

-- code-block:: yaml

   ---
  all:
    hosts:
      dkc-staging:
        ansible_host: data.kitware.com  # Modify this
        ansible_user: kitware  # Modify this
        ansible_become_password: ?bi0WbCA.  # Modify this
        ansible_ssh_private_key_file: /home/brian/.ssh/id_rsa  # Modify this
    vars:
      ansible_python_interpreter: auto

Then, edit this file:
* Modify the line with ``nginx_hostname: `` to reference the public DNS hostname of the server.


Download Role Dependencies
^^^^^^^^^^^^^^^^^^^^^^^^^^
This will
`download the external Ansible roles <https://galaxy.ansible.com/docs/using/installing.html#installing-multiple-roles-from-a-file>`_,
which will themselves install Girder.

First, create a file ``requirements.yml`` containing:

-- code-block:: yaml

   ---
   - src: girder.mongodb
     version: master
   - src: girder.girder
     version: master
   - src: girder.nginx
     version: master

Then, run:

-- code-block:: bash

   ansible-galaxy install --force --role-file=./requirements.yml --roles-path=./roles


Configure A Playbook
^^^^^^^^^^^^^^^^^^^^
This will...

First, create a file ``playbook.yml`` containing:

-- code-block:: yaml

   ---
   - name: Deploy Girder
     hosts: all
     vars:
       ansible_python_interpreter: auto
     roles:
       - role: girder.mongodb
       - role: girder.girder
       - role: girder.nginx
         vars:
           nginx_hostname: data.girder.test  # Modify this
           nginx_registration_email: "admin@girder.test"  # Modify this
     tasks:
       - name: Install Girder plugins
         pip:
           name:
             # Modify this list
             - girder-user-quota
             - git+https://github.com/girder/girder-table-view.git
           virtualenv: "{{ girder_virtualenv }}"
           state: latest
         notify:
           - Build Girder web client
           - Restart Girder

Then, edit this file:
* Modify the line with ``nginx_hostname: `` to reference the public DNS hostname of the server.
* Modify the line with ``nginx_registration_email`` to provide the email address of the
  system administrator. This is only provided to Let's Encrypt,
  `to provide warnings in case HTTPS auto-renewal is failing <https://letsencrypt.org/docs/expiration-emails/>`_.
  Under normal circumstances, no emails should ever be sent.
* Modify the list under the ``name:`` section of the ``Install Girder plugins`` task, to add any
  number of desired Girder plugins.
    * Ideally, PyPI names of published Girder plugin packages should be used, but unpublished
      packages may be specified in accordance with
      `pip's VCS support <https://pip.pypa.io/en/stable/reference/pip_install/#vcs-support>`_.
      See :ref:`plugins` for a list of official Girder plugins.
    * If no plugins are desired, set the line to ``name: []`` and delete list entries beneath.

Run The Playbook
^^^^^^^^^^^^^^^^

Run:

-- code-block:: bash

   ansible-playbook --inventory=./hosts.yml ./playbook.yml







TODO:
assetstore
    s3 instance profile https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html
girder_version: release?


Initial Setup
-------------

Admin Console
+++++++++++++

The first user to be created in the system is automatically given admin permission
over the instance, so the first thing you should do after starting your instance for
the first time is to register a user. After that succeeds, you should see a link
appear in the navigation bar that says ``Admin console``.

Plugins
+++++++

To change settings for plugins, click the ``Admin console`` navigation link, then click
``Plugins``. Here, you will see a list of installed plugins. If the plugin has
settings, click on the associated gear icon to modify them.

For information about specific plugins, see the :ref:`Plugins <plugins>` section.

Create Assetstore
+++++++++++++++++

After you have enabled any desired plugins and restarted the server, the next
recommended action is to create an ``Assetstore`` for your system. No users
can upload data to the system until an assetstore is created, since all files
in Girder must reside within an assetstore. See the :ref:`Assetstores <assetstores>` section
for a brief overview of ``Assetstores``.
